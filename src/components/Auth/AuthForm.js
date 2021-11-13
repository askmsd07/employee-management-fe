import { useState, useContext, Fragment } from "react";
import { useHistory } from "react-router-dom";

import AuthContext from "../../store/auth-context";
import classes from "./AuthForm.module.css";
import axios from "axios";
import { Form, Input, Button, Typography, notification } from "antd";

const AuthForm = () => {
  const history = useHistory();

  const authCtx = useContext(AuthContext);

  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const layout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 16 },
  };
  const [form] = Form.useForm();
  const switchAuthModeHandler = () => {
    setIsLogin((prevState) => !prevState);
  };

  const submitHandler = (values) => {
    setIsLoading(true);
    const { firstName, lastName, email, password } = values;
    let url;
    let data;
    if (isLogin) {
      url = `http://localhost:3000/api/login`;
      data = {
        email,
        password,
      };
    } else {
      url = `http://localhost:3000/api/signup`;
      data = {
        firstName,
        lastName,
        email,
        password,
      };
    }

    let authConfig = {
      method: "post",
      url,
      headers: {
        "Content-Type": "application/json",
      },
      data,
    };

    axios(authConfig)
      .then((authResponse) => {
        setIsLoading(false);
        form.resetFields();
        const { token, message } = authResponse.data;
        if (isLogin) {
          history.replace("/");
          const expirationTime = new Date(
            new Date().getTime() + +3600 * 1000 //1hr
          );
          authCtx.login(token, expirationTime.toISOString());
        } 

        if(!isLogin){
          notification.success({
            message
          })
          switchAuthModeHandler();
        }
      })
      .catch((authErr) => {
        alert(authErr.response.data.message);
        setIsLoading(false);
      });
  };

  return (
    <section className={classes.auth}>
      <h1>{isLogin ? "Login" : "Sign Up"}</h1>

      <Fragment>
        {isLogin && (
          <Form
            {...layout}
            form={form}
            name="control-hooks"
            onFinish={submitHandler}
          >
            <Form.Item name="email" label="Email" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item
              name="password"
              label="Password"
              rules={[{ required: true }]}
            >
              <Input.Password />
            </Form.Item>

            <Form.Item wrapperCol={{ offset: 4, span: 16 }}>
              {!isLoading && (
                <Button type="primary" htmlType="submit">
                  Login
                </Button>
              )}
              {isLoading && <p>Loging in...</p>}
            </Form.Item>

            <Typography.Text italic underline onClick={switchAuthModeHandler}>
              Create New Account
            </Typography.Text>
          </Form>
        )}
        {!isLogin && (
          <Form
            {...layout}
            form={form}
            name="control-hooks"
            onFinish={submitHandler}
          >
            <Form.Item
              name="firstName"
              label="First Name"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="lastName"
              label="Last Name"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
            <Form.Item name="email" label="Email" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item
              name="password"
              label="Password"
              rules={[{ required: true }]}
            >
              <Input.Password />
            </Form.Item>

            <Form.Item wrapperCol={{ offset: 4, span: 16 }}>
            {!isLoading && (
                <Button type="primary" htmlType="submit">
                  Signup
                </Button>
              )}
              {isLoading && <p>Creating new account...</p>}
            </Form.Item>

            <Typography.Text italic underline onClick={switchAuthModeHandler}>
              Already have an account?
            </Typography.Text>
          </Form>
        )}
      </Fragment>
    </section>
  );
};

export default AuthForm;
