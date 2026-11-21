import os
from ament_index_python.packages import get_package_share_directory
from launch import LaunchDescription
from launch.actions import DeclareLaunchArgument, RegisterEventHandler
from launch.event_handlers import OnProcessExit
from launch.substitutions import LaunchConfiguration
from launch_ros.actions import Node
from xacro import process_file

ARGUMENTS = [
    DeclareLaunchArgument('rsp_frequency', default_value='30.0', description='Robot State Publisher frequency.'),
    DeclareLaunchArgument('use_sim_time', default_value='false', description='Use simulation clock if true.'),
]

# 1. Load the robot description
def get_robot_description():
    pkg_doosan_ctrl = get_package_share_directory('doosan_control')
    robot_description_path = os.path.join(pkg_doosan_ctrl, 'urdf', 'doosan_ctrl.urdf')
    robot_description_config = process_file(robot_description_path)
    return robot_description_config.toprettyxml(indent='  ')

# 2. Generate launch description
def generate_launch_description():
    ld = LaunchDescription(ARGUMENTS)

    pkg_doosan_ctrl = get_package_share_directory('doosan_control')
    controller_config_path = os.path.join(pkg_doosan_ctrl, 'config', 'controller_manager.yaml')
    robot_desc = get_robot_description()

    use_sim_time = LaunchConfiguration('use_sim_time')
    rsp_frequency = LaunchConfiguration('rsp_frequency')

    # 3. Start Robot State Publisher
    robot_state_publisher_node = Node(
        package='robot_state_publisher',
        executable='robot_state_publisher',
        name='robot_state_publisher',
        output='both',
        parameters=[
            {
                'use_sim_time': use_sim_time,
                'publish_frequency': rsp_frequency,
                'robot_description': robot_desc,
            }
        ],
    )

    # 4. Start ros2_control_node (Controller Manager with Mock Hardware)
    ros2_control_node = Node(
        package='controller_manager',
        executable='ros2_control_node',
        parameters=[
            {'robot_description': robot_desc},
            controller_config_path,
        ],
        output='both',
    )

    # 5. Start and execute the controllers
    joint_state_broadcaster_spawner = Node(
        package='controller_manager',
        executable='spawner',
        arguments=['joint_state_broadcaster'],
        output='screen',
    )

    doosan_controller_spawner_general = Node(
        package='controller_manager',
        executable='spawner',
        arguments=[
            'joint_trajectory_controller_general',
            '--param-file',
            controller_config_path,
        ],
        output='screen',
    )

    delay_trajectory_controller = RegisterEventHandler(
        event_handler=OnProcessExit(
            target_action=joint_state_broadcaster_spawner,
            on_exit=[doosan_controller_spawner_general],
        )
    )

    # 6. Start RViz2
    rviz_node = Node(
        package='rviz2',
        executable='rviz2',
        name='rviz2',
        output='screen',
    )

    ld.add_action(robot_state_publisher_node)
    ld.add_action(ros2_control_node)
    ld.add_action(joint_state_broadcaster_spawner)
    ld.add_action(delay_trajectory_controller)
    ld.add_action(rviz_node)

    return ld