import { message, Table, Button, Popconfirm } from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { GetAllUsers, DeleteUser } from "../../apicalls/users";
import { ShowLoader } from "../../redux/loaderSlice";
import { DeleteOutlined } from "@ant-design/icons";

function UsersList() {
  const [users, setUsers] = useState([]);
  const dispatch = useDispatch();

  const loggedInUser = JSON.parse(localStorage.getItem("user"));

  const getData = async () => {
    try {
      dispatch(ShowLoader(true));
      const response = await GetAllUsers();
      dispatch(ShowLoader(false));
      if (response.success) {
        setUsers(response.data);
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      dispatch(ShowLoader(false));
      message.error(error.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      if (id === loggedInUser.id) {
        message.warning("You cannot delete your own account!");
        return;
      }

      dispatch(ShowLoader(true));
      const response = await DeleteUser(id);
      dispatch(ShowLoader(false));
      if (response.success) {
        message.success("User deleted successfully");
        getData();
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      dispatch(ShowLoader(false));
      message.error(error.message);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
    },
    {
      title: "Name",
      dataIndex: "name",
    },
    {
      title: "Email",
      dataIndex: "email",
    },
    {
      title: "Role",
      dataIndex: "role",
      render: (role) => role?.toUpperCase(),
    },
    {
      title: "Action",
      dataIndex: "action",
      render: (_, record) => {
        const isCurrentUser = record.id === loggedInUser.id;

        return (
          <Popconfirm
            title="Are you sure you want to delete this user?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
            disabled={isCurrentUser}
          >
            <Button
              danger
              type="primary"
              icon={<DeleteOutlined />}
              disabled={isCurrentUser}
              style={{
                borderRadius: "8px",
                opacity: isCurrentUser ? 0.5 : 1,
                cursor: isCurrentUser ? "not-allowed" : "pointer",
              }}
            >
              Delete
            </Button>
          </Popconfirm>
        );
      },
    },
  ];

  return (
      <Table
        columns={columns}
        dataSource={users}
        rowKey="id"
        pagination={{ pageSize: 6 }}
      />
  );
}

export default UsersList;
