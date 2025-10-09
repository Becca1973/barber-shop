import { message, Table } from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { GetAllBarbers, UpdateBarber } from "../../apicalls/barbers";
import { ShowLoader } from "../../redux/loaderSlice";

function BarbersList() {
  const [barbers, setBarbers] = useState([]);

  const dispatch = useDispatch();
  const getData = async () => {
    try {
      dispatch(ShowLoader(true));
      const response = await GetAllBarbers();
      dispatch(ShowLoader(false));
      if (response.success) {
        setBarbers(response.data);
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      dispatch(ShowLoader(false));
      message.error(error.message);
    }
  };

  const changeStatus = async (payload) => {
    const action = payload.status === "approved" ? "approve" : "reject";
    if (!window.confirm(`Are you sure you want to ${action} this barber?`)) {
      return;
    }

    try {
      dispatch(ShowLoader(true));
      const response = await UpdateBarber(payload);
      dispatch(ShowLoader(false));

      if (response.success) {
        message.success(response.message);
        getData();
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      message.error(error.message);
      dispatch(ShowLoader(false));
    }
  };

  useEffect(() => {
    getData();
  }, []);

  const columns = [
    {
      title: "First Name",
      dataIndex: "firstName",
    },
    {
      title: "Last Name",
      dataIndex: "lastName",
    },
    {
      title: "Email",
      dataIndex: "email",
    },
    {
      title: "Phone",
      dataIndex: "phone",
    },
    {
      title: "Gender",
      dataIndex: "gender",
    },
    {
      title: "Experience",
      dataIndex: "experience",
    },
    {
      title: "Speciality",
      dataIndex: "speciality",
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (text) => {
        let color = "black";
        if (text === "approved") color = "green";
        else if (text === "pending") color = "orange";
        else if (text === "rejected") color = "red";
        return (
          <span style={{ color, fontWeight: "bold" }}>
            {text.toUpperCase()}
          </span>
        );
      },
    },
    {
      title: "Actions",
      dataIndex: "actions",
      render: (text, record) => {
        if (record.status === "pending") {
          return (
            <div className="flex gap-1">
              <span
                className="underline cursor-pointer"
                onClick={() =>
                  changeStatus({
                    ...record,
                    status: "rejected",
                  })
                }
              >
                Reject
              </span>
              <span
                className="underline cursor-pointer"
                onClick={() =>
                  changeStatus({
                    ...record,
                    status: "approved",
                  })
                }
              >
                Approve
              </span>
            </div>
          );
        }
        if (record.status === "approved") {
          return (
            <div className="flex gap-1">
              <span
                className="underline cursor-pointer"
                onClick={() =>
                  changeStatus({
                    ...record,
                    status: "rejected",
                  })
                }
              >
                Reject
              </span>
            </div>
          );
        }
        if (record.status === "blocked") {
          return (
            <div className="flex gap-1">
              <span
                className="underline cursor-pointer"
                onClick={() =>
                  changeStatus({
                    ...record,
                    status: "approved",
                  })
                }
              >
                Unblock
              </span>
            </div>
          );
        }
      },
    },
  ];

  return <Table columns={columns} dataSource={barbers}></Table>;
}

export default BarbersList;
