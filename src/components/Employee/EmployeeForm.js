import { useState, useEffect, useCallback } from "react";

import classes from "./EmployeeForm.module.css";
import {
  Form,
  Input,
  Button,
  Modal,
  Table,
  Divider,
  notification,
  Tooltip,
  // Icon,
  Popconfirm,
} from "antd";
import { EditFilled, DeleteFilled } from "@ant-design/icons";
import { Fragment } from "react/cjs/react.production.min";
import axios from "axios";

const EmployeeForm = () => {
  const [errMsg, setErrorMsg] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [form] = Form.useForm();
  const [dataSource, setDataSource] = useState([]);

  const columns = [
    {
      title: "Employee Id",
      dataIndex: "employee_id",
      key: "id",
    },
    {
      title: "Employee Name",
      dataIndex: "employee_name",
      key: "name",
    },
    {
      title: "Mobile",
      dataIndex: "mobile",
      key: "mobile",
    },
    {
      title: "Age",
      dataIndex: "age",
      key: "age",
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
    },
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
    },
  ];

  const showEditModal = useCallback(
    (details) => {
      setIsEditing(true);
      const { id, employee_id, employee_name, age, address, mobile } = details;
      form.setFieldsValue({
        id,
        employeeId: employee_id,
        employeeName: employee_name,
        age,
        address,
        mobile,
      });
      setIsModalVisible(true);
    },
    [form]
  );

  const deleteEmployee = useCallback(async (details) => {
    try {
      let deletionConfig = {
        method: "delete",
        url: `http://localhost:3000/api/employees/${details.employee_id}`,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      };
      await axios(deletionConfig);
      notification.success({ message: "Deleted Successfully" });
      setDataSource((prevState) => {
        let previousValues = [...prevState];
        let selectedIndex = previousValues.findIndex(
          (emp) => emp.employee_id.toString() === details.employee_id.toString()
        );
        previousValues.splice(selectedIndex, 1);
        return previousValues;
      });
    } catch (e) {
      const { message } = e.response.data;
      notification.error({ message: message || "Deletion failed" });
    }
  }, []);

  const getAction = useCallback(
    (details) => {
      return (
        <div>
          <Tooltip placement="left" title={"Edit"}>
            <EditFilled
              type={"edit"}
              theme="filled"
              twoToneColor="#fa8c16"
              style={{ marginRight: 5, color: "#0000FF" }}
              onClick={() => {
                showEditModal(details);
              }}
            />
          </Tooltip>
          |
          <Tooltip placement="right" title={"Delete"}>
            <Popconfirm
              title="Sure to delete the record permanently? This action cannot be undone."
              onConfirm={(e) => deleteEmployee(details)}
            >
              <DeleteFilled
                type={"delete"}
                theme="outlined"
                twoToneColor="#fa8c16"
                style={{ marginLeft: 5, color: "#FF0000" }}
              />
            </Popconfirm>
          </Tooltip>
        </div>
      );
    },
    [showEditModal, deleteEmployee]
  );

  useEffect(() => {
    try {
      const getEmployeeList = async () => {
        let config = {
          url: "http://localhost:3000/api/employees/",
          method: "get",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        };

        const employeeResponse = await axios(config);
        const {
          data: { data: employeeList },
        } = employeeResponse;
        let dataSource = employeeList.map((employee) => {
          return {
            ...employee,
            key: employee.id,
            action: getAction({ ...employee }),
          };
        });
        setDataSource(dataSource);
      };

      getEmployeeList();
    } catch (e) {
      setDataSource([]);
    }
  }, [getAction]);

  const layout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 16 },
  };

  const handleAddEmployee = async (values) => {
    try {
      setErrorMsg(null);
      const { id, employeeId, employeeName, age, address, mobile } = values;
      let addEmployeeConfig = {
        method: isEditing ? "put" : "post",
        url: `http://localhost:3000/api/employees`,
        data: {
          id,
          employeeId,
          employeeName,
          age,
          address,
          mobile,
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      };

      const {
        data: { message },
      } = await axios(addEmployeeConfig);

      notification.success({
        message,
      });

      if (isEditing) {
        let updatedEmployeeList = [...dataSource];
        let selectedEmpIndex = updatedEmployeeList.findIndex(
          (emp) => emp.employee_id === employeeId
        );
        updatedEmployeeList[selectedEmpIndex] = {
          ...updatedEmployeeList[selectedEmpIndex],
          employee_id: employeeId,
          employee_name: employeeName,
          age,
          address,
          mobile,
        };
        setDataSource(updatedEmployeeList);
      } else {
        setDataSource((prevState) => [
          ...prevState,
          {
            employee_id: employeeId,
            employee_name: employeeName,
            age,
            address,
            mobile,
          },
        ]);
      }

      setIsModalVisible(false);
      form.resetFields();
    } catch (e) {
      const { message } = e.response.data;
      setErrorMsg(message);
    }
  };

  const showModal = () => {
    setIsEditing(false);
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
  };

  return (
    <Fragment>
      <div className={classes.list}>
        <div style={{ textAlign: "right", marginRight: "10px" }}>
          <Button type="primary" onClick={showModal}>
            Add Employee
          </Button>
        </div>

        <Divider />

        <Modal
          title={!isEditing ? "Add Employee" : "Update Employee"}
          visible={isModalVisible}
          footer={[]}
          onCancel={closeModal}
        >
          <Form
            {...layout}
            form={form}
            name="control-hooks"
            onFinish={handleAddEmployee}
          >
            <Form.Item name="id" label="id" hidden>
              <Input />
            </Form.Item>
            <Form.Item
              name="employeeId"
              label="Employee Id"
              rules={[{ required: true }]}
            >
              <Input disabled={isEditing} />
            </Form.Item>
            <Form.Item
              name="employeeName"
              label="Employee Name"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
            <Form.Item name="age" label="Age" rules={[{ required: true }]}>
              <Input maxLength={3} />
            </Form.Item>
            <Form.Item
              name="mobile"
              label="Mobile No"
              rules={[{ required: true }]}
            >
              <Input minLength={10} maxLength={10} />
            </Form.Item>
            <Form.Item
              name="address"
              label="Address"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
            <Form.Item wrapperCol={{ offset: 9, span: 16 }}>
              <Button type="primary" htmlType="submit">
                {!isEditing ? "Add Employee" : "Update Employee"}
              </Button>
            </Form.Item>

            {errMsg && (
              <p style={{ textAlign: "center", color: "red" }}>{errMsg}</p>
            )}
          </Form>
        </Modal>

        <Table columns={columns} dataSource={dataSource} />
      </div>
    </Fragment>
  );
};

export default EmployeeForm;
