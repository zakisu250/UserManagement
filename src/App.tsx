import 'antd/dist/reset.css';
import './App.css';
import { Button, Table, Modal, Form, Input, message } from 'antd';
import React, { useState } from 'react';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
} from 'react-query';
import axios from 'axios';

const API_ENDPOINT =
  'https://user-management-backend-dkt7jq7r4-zakisu250.vercel.app/users';

const queryClient = new QueryClient();

interface User {
  id: number;
  name: string;
  email: string;
  password: string | number;
  phone: string | number;
}

function App() {
  const queryClient = useQueryClient();

  const { data: dataSource } = useQuery<User[]>('users', async () => {
    const response = await axios.get(API_ENDPOINT);
    return response.data;
  });

  const addUserMutation = useMutation((newUser: User) => {
    return axios.post(API_ENDPOINT, newUser);
  });

  const columns = [
    {
      key: '1',
      title: 'ID',
      dataIndex: 'id',
    },
    {
      key: '2',
      title: 'Name',
      dataIndex: 'name',
    },
    {
      key: '3',
      title: 'Email',
      dataIndex: 'email',
    },
    {
      key: '4',
      title: 'Password',
      dataIndex: 'password',
    },
    {
      key: '5',
      title: 'Phone Number',
      dataIndex: 'phone',
    },
    {
      key: '6',
      title: 'Action',
      render: (text: string, record: User) => (
        <div>
          <EditOutlined
            style={{ color: 'green' }}
            onClick={() => showEditModal(record)}
          />
          <DeleteOutlined
            style={{ color: 'red', marginLeft: 15 }}
            onClick={() => handleDelete(record.id)}
          />
        </div>
      ),
    },
  ];

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [editUser, setEditUser] = useState<User | null>(null);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const showEditModal = (user: User) => {
    setEditUser(user);
    editForm.setFieldsValue(user);
    setIsEditModalVisible(true);
  };

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        const newUser: User = { id: (dataSource?.length || 0) + 1, ...values };
        addUserMutation.mutate(newUser, {
          onSettled: () => {
            queryClient.invalidateQueries('users');
            setIsModalVisible(false);
            message.success('User added successfully');
          },
        });
        form.resetFields();
      })
      .catch((errorInfo) => {
        console.log('Validation failed:', errorInfo);
        message.error('User not added');
      });
  };

  const handleEditOk = () => {
    editForm
      .validateFields()
      .then((values) => {
        // Update user using a PUT request
        if (editUser) {
          axios
            .patch(`${API_ENDPOINT}/${editUser.id}`, values) // Use the user's ID to specify the user to update
            .then((response) => {
              queryClient.invalidateQueries('users');
              setIsEditModalVisible(false);
              message.success('User updated successfully');
            })
            .catch((error) => {
              console.error('Error updating user:', error);
              message.error('User not updated');
            });
        }
      })
      .catch((errorInfo) => {
        console.log('Validation failed:', errorInfo);
      });
  };

  const handleCancel = () => {
    form.resetFields();
    setIsModalVisible(false);
  };

  const handleDelete = async (userId: number) => {
    try {
      await axios.delete(`${API_ENDPOINT}/${userId}`);
      queryClient.invalidateQueries('users');
      message.success('User deleted successfully');
    } catch (error) {
      console.error('Error deleting user:', error);
      message.error('User not deleted');
    }
  };

  const handleEditCancel = () => {
    editForm.resetFields();
    setIsEditModalVisible(false);
  };

  return (
    <div className="App">
      <header className="App-header">
        <Button
          style={{ background: 'greenyellow', marginBottom: 20 }}
          onClick={showModal}
        >
          Add User
        </Button>
        <div style={{ overflowX: 'auto' }}>
          <Table columns={columns} dataSource={dataSource} />
        </div>
      </header>

      <Modal
        title="Add User"
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Form form={form} name="addUserForm" layout="vertical">
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Please enter a name' }]}
          >
            <Input type="name" />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please enter an email' },
              { type: 'email', message: 'Invalid email format' },
            ]}
          >
            <Input type="email" />
          </Form.Item>
          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: 'Please enter a password' }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="phone"
            label="Phone Number"
            rules={[{ required: true, message: 'Please enter a phone number' }]}
          >
            <Input type="phone" />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="Edit User"
        visible={isEditModalVisible}
        onOk={handleEditOk}
        onCancel={handleEditCancel}
      >
        <Form form={editForm} name="editUserForm" layout="vertical">
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Please enter a name' }]}
            initialValue={editUser?.name}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please enter an email' },
              { type: 'email', message: 'Invalid email format' },
            ]}
            initialValue={editUser?.email}
          >
            <Input type="email" />
          </Form.Item>
          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: 'Please enter a password' }]}
            initialValue={editUser?.password}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="phone"
            label="Phone Number"
            rules={[{ required: true, message: 'Please enter a phone number' }]}
            initialValue={editUser?.phone}
          >
            <Input type="phone" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default function WrappedApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  );
}
