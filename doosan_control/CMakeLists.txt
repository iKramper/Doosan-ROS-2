cmake_minimum_required(VERSION 3.8)

project(doosan_control)

# ==========================================
# ESTÁNDAR DE C++
# ==========================================

if(NOT CMAKE_CXX_STANDARD)
    set(CMAKE_CXX_STANDARD 17)
    set(CMAKE_CXX_STANDARD_REQUIRED ON)
endif()

if(CMAKE_COMPILER_IS_GNUCXX OR CMAKE_CXX_COMPILER_ID MATCHES "Clang")
    add_compile_options(-Wall -Wextra -Wpedantic)
endif()

# ==========================================
# DEPENDENCIAS ROS 2
# ==========================================

find_package(ament_cmake REQUIRED)
find_package(control_msgs REQUIRED)
find_package(trajectory_msgs REQUIRED)
find_package(rclcpp REQUIRED)
find_package(rclcpp_action REQUIRED)
find_package(rclcpp_components REQUIRED)

# ==========================================
# COMPONENTE DE TRAYECTORIA MANOLIS
# ==========================================

add_library(manolis_trajectory_component SHARED
    src/manolis_trajectory.cpp
)

target_include_directories(manolis_trajectory_component PRIVATE
    $<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}/include>
    $<INSTALL_INTERFACE:include>
)

ament_target_dependencies(manolis_trajectory_component
    control_msgs
    trajectory_msgs
    rclcpp
    rclcpp_action
    rclcpp_components
)

# ==========================================
# REGISTRO DEL NODO ROS 2
# ==========================================

rclcpp_components_register_node(
    manolis_trajectory_component
    PLUGIN "manolis_control::ManolisTrajectory"
    EXECUTABLE manolis_trajectory
)

# ==========================================
# INSTALACIÓN
# ==========================================

install(TARGETS
    manolis_trajectory_component
    ARCHIVE DESTINATION lib
    LIBRARY DESTINATION lib
    RUNTIME DESTINATION bin
)

install(
    DIRECTORY config launch src urdf
    DESTINATION share/${PROJECT_NAME}
    OPTIONAL
)

# ==========================================
# FINALIZACIÓN DEL PAQUETE
# ==========================================

ament_package()