#include <chrono>
#include <cstdint>
#include <functional>
#include <initializer_list>
#include <memory>
#include <string>

#include "rclcpp/rclcpp.hpp"
#include "rclcpp_action/rclcpp_action.hpp"
#include "rclcpp_components/register_node_macro.hpp"

#include "control_msgs/action/follow_joint_trajectory.hpp"
#include "trajectory_msgs/msg/joint_trajectory_point.hpp"

namespace manolis_control
{

class ManolisTrajectory : public rclcpp::Node
{
public:

  using FollowJointTrajectory = control_msgs::action::FollowJointTrajectory;
  using JointTrajectoryPoint = trajectory_msgs::msg::JointTrajectoryPoint;

  using GoalHandleFollowJointTrajectory = rclcpp_action::ClientGoalHandle<FollowJointTrajectory>;

  explicit ManolisTrajectory(
    const rclcpp::NodeOptions & options)
  : Node("manolis_trajectory", options)
  {
    // Crear cliente de acciones
    trajectory_client_ptr_ =
      rclcpp_action::create_client<FollowJointTrajectory>(
        this,
        "/joint_trajectory_controller_general/"
        "follow_joint_trajectory"
      );

    RCLCPP_INFO(
      this->get_logger(),
      "Nodo ManolisTrajectory iniciado"
    );

    // Ejecutar la trayectoria una sola vez
    timer_ = this->create_wall_timer(
      std::chrono::milliseconds(500),
      [this]() {
        this->send_goal();
      }
    );
  }

private:

  // ==========================================
  // AGREGAR UN PUNTO A LA TRAYECTORIA
  // ==========================================

  void add_point(
    FollowJointTrajectory::Goal & goal,
    std::initializer_list<double> positions,
    int32_t sec,
    uint32_t nanosec)
  {
    JointTrajectoryPoint point;

    point.positions.assign(
      positions.begin(),
      positions.end()
    );

    point.time_from_start.sec = sec;
    point.time_from_start.nanosec = nanosec;

    goal.trajectory.points.push_back(point);
  }


  // ==========================================
  // ENVIAR TRAYECTORIA AL CONTROLADOR
  // ==========================================

  void send_goal()
  {
    // Cancelar temporizador para evitar
    // enviar la trayectoria varias veces
    timer_->cancel();

    RCLCPP_INFO(
      this->get_logger(),
      "Esperando servidor FollowJointTrajectory..."
    );

    // Verificar disponibilidad del controlador
    if (!trajectory_client_ptr_->wait_for_action_server(
          std::chrono::seconds(10)))
    {
      RCLCPP_ERROR(
        this->get_logger(),
        "Servidor de acciones no disponible"
      );
      return;
    }

    // Crear mensaje de objetivo
    auto goal_msg = FollowJointTrajectory::Goal();

    // ==========================================
    // ARTICULACIONES DEL DOOSAN E0509
    // ==========================================

    goal_msg.trajectory.joint_names =
    {
      "joint_seventh_axis",
      "joint_1",
      "joint_2",
      "joint_3",
      "joint_4",
      "joint_5",
      "joint_6"
    };

    // ==========================================
    // TRAYECTORIA COMPLETA
    // ==========================================

    // POSICION INICIAL
    // Punto 1 - 3 segundos

    add_point(
      goal_msg,
      {0.0, 1.5708, -0.35, 1.45, 0.0, 0.47, 0.0},
      3, 0
    );

    // ==========================================
    // PRIMERA SECUENCIA
    // ==========================================

    // Punto 2 - 5.5 segundos
    add_point(
      goal_msg,
      {-0.10, 1.5708, -0.35, 1.45, 0.0, 0.47, 0.0},
      5, 500000000
    );

    // Punto 3 - 8.5 segundos
    add_point(
      goal_msg,
      {-0.10, 1.5708, 0.65, 0.85, 0.0, 0.75, 0.0},
      8, 500000000
    );

    // Punto 4 - 12 segundos
    add_point(
      goal_msg,
      {-0.10, 1.5708, 0.85, 0.55, 0.0, 0.35, 0.0},
      12, 0
    );

    // Punto 5 - 15 segundos
    add_point(
      goal_msg,
      {-0.10, 1.5708, 0.15, 0.65, 0.0, 0.30, 0.0},
      15, 0
    );

    // Punto 6 - 18 segundos
    add_point(
      goal_msg,
      {-0.10, 1.5708, -0.35, 1.45, 0.0, 0.47, 0.0},
      18, 0
    );

    // Punto 7 - 21 segundos
    add_point(
      goal_msg,
      {0.0, 1.5708, -0.35, 1.45, 0.0, 0.47, 0.0},
      21, 0
    );

    // ==========================================
    // SEGUNDA SECUENCIA
    // ==========================================

    // Punto 8 - 24 segundos
    add_point(
      goal_msg,
      {0.0, -1.5708, -0.35, 1.45, 0.0, 0.47, 0.0},
      24, 0
    );

    // Punto 9 - 25 segundos
    add_point(
      goal_msg,
      {0.0, -1.5708, -0.15, 1.75, 0.0, 0.15, 0.0},
      25, 0
    );

    // Punto 10 - 28 segundos
    add_point(
      goal_msg,
      {0.0, -1.5708, 0.25, 1.35, 0.0, 0.95, 0.0},
      28, 0
    );

    // Punto 11 - 29.5 segundos
    add_point(
      goal_msg,
      {0.0, -1.5708, 0.25, 1.35, 0.0, 0.95, 0.0},
      29, 500000000
    );

    // Punto 12 - 32 segundos
    add_point(
      goal_msg,
      {0.0, -1.5708, -0.35, 1.45, 0.0, 0.47, 0.0},
      32, 0
    );

    // ==========================================
    // TERCERA SECUENCIA
    // ==========================================

    // Punto 13 - 35.5 segundos
    add_point(
      goal_msg,
      {-0.38, -1.5708, -0.35, 1.45, 0.0, 0.47, 0.0},
      35, 500000000
    );

    // Punto 14 - 38.5 segundos
    add_point(
      goal_msg,
      {-0.38, -1.5708, 0.55, 1.05, 0.0, 1.15, 0.0},
      38, 500000000
    );

    // Punto 15 - 43.5 segundos
    add_point(
      goal_msg,
      {-0.38, -1.5708, 0.55, 1.05, 0.0, 1.15, 0.0},
      43, 500000000
    );

    // Punto 16 - 47 segundos
    add_point(
      goal_msg,
      {-0.38, -1.5708, -0.35, 1.45, 0.0, 0.47, 0.0},
      47, 0
    );

    // ==========================================
    // RETORNO
    // ==========================================

    // Punto 17 - 50 segundos
    add_point(
      goal_msg,
      {-0.38, 1.5708, -0.35, 1.45, 0.0, 0.47, 0.0},
      50, 0
    );

    // Punto 18 - 53 segundos
    add_point(
      goal_msg,
      {0.0, 1.5708, 0.0, 0.0, 0.0, 0.0, 0.0},
      53, 0
    );

    // ==========================================
    // ENVIAR OBJETIVO
    // ==========================================

    RCLCPP_INFO(
      this->get_logger(),
      "Enviando trayectoria de 18 puntos..."
    );

    auto send_goal_options =
      rclcpp_action::Client<
        FollowJointTrajectory
      >::SendGoalOptions();

    // ==========================================
    // RESPUESTA DEL SERVIDOR
    // ==========================================

    send_goal_options.goal_response_callback =
      [this](
        const GoalHandleFollowJointTrajectory::SharedPtr &
          goal_handle)
    {
      if (!goal_handle)
      {
          RCLCPP_ERROR(
              this->get_logger(),
              "El controlador rechazo la trayectoria"
          );

          rclcpp::shutdown();
          return;
      }
    };

    // ==========================================
    // FEEDBACK DE LAS ARTICULACIONES
    // ==========================================

    send_goal_options.feedback_callback =
      [this](
        GoalHandleFollowJointTrajectory::SharedPtr,
        const std::shared_ptr<
          const FollowJointTrajectory::Feedback
        > feedback)
    {
      // Verificar que existan datos
      if (
        feedback->desired.positions.size() < 7 ||
        feedback->actual.positions.size() < 7
      )
      {
        return;
      }

      // Mostrar informacion cada segundo
      RCLCPP_INFO_THROTTLE(
        this->get_logger(),
        *this->get_clock(),
        1000,
        "Eje 7: Deseado %.3f | Actual %.3f "
        "- Joint 1: Deseado %.3f | Actual %.3f",
        feedback->desired.positions[0],
        feedback->actual.positions[0],
        feedback->desired.positions[1],
        feedback->actual.positions[1]
      );
    };

    // ==========================================
    // RESULTADO FINAL DE LA ACCION
    // ==========================================

    send_goal_options.result_callback =
      [this](
        const GoalHandleFollowJointTrajectory::WrappedResult & result)
    {
        bool exito = false;

        switch (result.code)
        {
            case rclcpp_action::ResultCode::SUCCEEDED:

                if (
                    result.result &&
                    result.result->error_code ==
                    FollowJointTrajectory::Result::SUCCESSFUL
                )
                {
                    RCLCPP_INFO(
                        this->get_logger(),
                        "TRAYECTORIA MANOLIS FINALIZADA CORRECTAMENTE"
                    );

                    exito = true;
                }
                else
                {
                    RCLCPP_ERROR(
                        this->get_logger(),
                        "El controlador reporto un error de trayectoria"
                    );

                    if (result.result)
                    {
                        RCLCPP_ERROR(
                            this->get_logger(),
                            "Codigo: %d - Descripcion: %s",
                            result.result->error_code,
                            result.result->error_string.c_str()
                        );
                    }
                }

                break;

            case rclcpp_action::ResultCode::ABORTED:

                RCLCPP_ERROR(
                    this->get_logger(),
                    "Trayectoria abortada"
                );
                break;

            case rclcpp_action::ResultCode::CANCELED:

                RCLCPP_WARN(
                    this->get_logger(),
                    "Trayectoria cancelada"
                );
                break;

            default:

                RCLCPP_ERROR(
                    this->get_logger(),
                    "Resultado desconocido"
                );
                break;
        }

        if (exito)
        {
            RCLCPP_INFO(
                this->get_logger(),
                "Robot disponible para un nuevo pedido"
            );
        }

        RCLCPP_INFO(
            this->get_logger(),
            "Cerrando nodo manolis_trajectory..."
        );

        // Finalizar el proceso ROS 2
        rclcpp::shutdown();
    };

    // Envio asincrono
    trajectory_client_ptr_->async_send_goal(
      goal_msg,
      send_goal_options
    );
  }

  rclcpp_action::Client<FollowJointTrajectory>::SharedPtr trajectory_client_ptr_;
  rclcpp::TimerBase::SharedPtr timer_;

};

}  // namespace manolis_control

RCLCPP_COMPONENTS_REGISTER_NODE(manolis_control::ManolisTrajectory)