import { message, Table, Modal, Input } from "antd";
import React, { useEffect, useState } from "react";
import { CloseCircleOutlined } from "@ant-design/icons";
import { useDispatch } from "react-redux";
import {
  GetBarberAppointments,
  GetUserAppointments,
  UpdateAppointmentStatus,
} from "../../apicalls/appointments";
import { ShowLoader } from "../../redux/loaderSlice";
import moment from "moment";

function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
  const dispatch = useDispatch();

  const user = JSON.parse(localStorage.getItem("user"));

  const getData = async () => {
    let response;
    if (user.role === "barber") {
      response = await GetBarberAppointments(user.id);
    } else {
      response = await GetUserAppointments(user.id);
    }
    if (response.success) setAppointments(response.data);
  };

  const openCancelModal = (id) => {
    setSelectedAppointmentId(id);
    setCancelReason("");
    setCancelModalVisible(true);
  };

  const handleCancel = async () => {
    // Če je user, preverimo, da vnese razlog
    if (user.role !== "barber" && !cancelReason.trim()) {
      message.warning("Please enter a reason for cancellation");
      return;
    }

    await onUpdate(selectedAppointmentId, "cancelled", cancelReason);
    setCancelModalVisible(false);
  };

  const onUpdate = async (id, status, reason = "") => {
    try {
      dispatch(ShowLoader(true));
      const payload = reason ? { cancelReason: reason } : {};
      const response = await UpdateAppointmentStatus(id, status, payload);
      if (response.success) {
        message.success(response.message);
        getData();
      } else {
        message.error(response.message);
      }
      dispatch(ShowLoader(false));
    } catch (error) {
      message.error(error.message);
      dispatch(ShowLoader(false));
    }
  };

  const columns = [
    { title: "Date", dataIndex: "date" },
    { title: "Time", dataIndex: "slot" },
    { title: "Barber", dataIndex: "barberName" },
    { title: "Service", dataIndex: "service" },
    { title: "User", dataIndex: "userName" },
    { title: "Booked At", dataIndex: "bookedOn" },
    { title: "Description", dataIndex: "description" },
    { title: "Status", dataIndex: "status" },
    // Cancel Reason vidno samo barberju
    ...(user.role === "barber"
      ? [
          {
            title: "Cancel Reason",
            dataIndex: "cancelReason",
            render: (text, record) =>
              record.status === "cancelled" && record.cancelReason ? text : "-",
          },
        ]
      : []),
    {
      title: "Action",
      dataIndex: "action",
      align: "center",
      render: (text, record) => {
        // Če je že preklicano
        if (record.status === "cancelled") {
          return (
            <CloseCircleOutlined style={{ color: "red", fontSize: "18px" }} />
          );
        }

        const appointmentDate = moment(record.date);
        const daysDiff = appointmentDate.diff(moment(), "days");
        const canCancel = user.role === "barber" || daysDiff >= 3;

        // Če user ne more cancelati (manj kot 3 dni)
        if (!canCancel && user.role !== "barber") {
          return (
            <span style={{ color: "gray" }}>Cannot cancel within 3 days</span>
          );
        }

        // Gumb za cancel
        return (
          <button
            onClick={() =>
              user.role !== "barber"
                ? openCancelModal(record.id)
                : onUpdate(record.id, "cancelled")
            }
            style={{
              backgroundColor: "red",
              color: "white",
              border: "none",
              borderRadius: "4px",
              padding: "4px 10px",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
        );
      },
    },
  ];

  useEffect(() => {
    getData();
  }, []);

  return (
    <>
      <Table columns={columns} dataSource={appointments} rowKey="id" />

      {/* Modal za vnosa razloga, samo user */}
      {user.role !== "barber" && (
        <Modal
          title="Cancel Appointment"
          visible={cancelModalVisible}
          onOk={handleCancel}
          onCancel={() => setCancelModalVisible(false)}
          okText="Submit"
          okButtonProps={{
            style: {
              backgroundColor: "red",
              borderColor: "red",
              color: "white",
            },
          }}
        >
          <p>Please enter a reason for cancellation:</p>
          <Input.TextArea
            rows={4}
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
          />
        </Modal>
      )}
    </>
  );
}

export default Appointments;
