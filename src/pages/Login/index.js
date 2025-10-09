import React, { useEffect } from "react";
import { Form, message } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { LoginUser } from "../../apicalls/users";
import { useDispatch } from "react-redux";
import { ShowLoader } from "../../redux/loaderSlice";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const onFinish = async (values) => {
    try {
      dispatch(ShowLoader(true));
      const response = await LoginUser(values);
      dispatch(ShowLoader(false));
      if (response.success) {
        message.success(response.message);
        localStorage.setItem(
          "user",
          JSON.stringify({
            ...response.data,
            password: "",
          })
        );
        navigate("/");
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      dispatch(ShowLoader(false));
      message.error(error.message);
    }
  };
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) navigate("/");
  }, []);
  return (
    <div className="flex h-screen justify-center p-2 marginttop">
      <Form
        layout="vertical"
        className="w-400 h-400 rounded bg-white p-3"
        onFinish={onFinish}
      >
        <h2 className="uppercase my-1">
          <strong>Barber Shop Login</strong>
        </h2>
        <hr />
        <Form.Item label="Email" name="email">
          <input type="email" />
        </Form.Item>
        <Form.Item label="Password" name="password">
          <input type="password" />
        </Form.Item>
        <button className="contained-btn my-1 w-full" type="submit">
          LOGIN
        </button>
        <Link className="underline" to="/register">
          Dont have an accout? <strong>Sign Up</strong>
        </Link>
      </Form>
    </div>
  );
};

export default Login;
