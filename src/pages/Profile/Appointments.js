import { message, Table } from "antd";
import React, { useEffect, useState } from "react";
import { CloseCircleOutlined } from "@ant-design/icons";
import { useDispatch } from "react-redux";
import {
  GetBarberAppointments,
  GetUserAppointments,
  UpdateAppointmentStatus,
} from "../../apicalls/appointments";
import { ShowLoader } from "../../redux/loaderSlice";

function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const dispatch = useDispatch();

  const getData = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user.role === "barber") {
      const response = await GetBarberAppointments(user.id);
      if (response.success) setAppointments(response.data);
    } else {
      const response = await GetUserAppointments(user.id);
      if (response.success) setAppointments(response.data);
    }
  };

  const handleCancel = (id) => {
    if (window.confirm("Are you sure you want to cancel this appointment?")) {
      onUpdate(id, "cancelled");
    }
  };

  const onUpdate = async (id, status) => {
    try {
      dispatch(ShowLoader(true));
      const response = await UpdateAppointmentStatus(id, status);
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
    {
      title: "Action",
      dataIndex: "action",
      align: "center",
      render: (text, record) => {
        const user = JSON.parse(localStorage.getItem("user"));

        // Če je rezervacija še ni preklicana, pokaži gumb Cancel
        if (record.status !== "cancelled") {
          return (
            <button
              onClick={() => handleCancel(record.id)}
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
        }

        // Če je rezervacija že preklicana, pokaži ikono
        return (
          <CloseCircleOutlined style={{ color: "red", fontSize: "18px" }} />
        );
      },
    },
  ];

  useEffect(() => {
    getData();
  }, []);

  return <Table columns={columns} dataSource={appointments} rowKey="id" />;
}

export default Appointments;
