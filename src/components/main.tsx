"use client";

import {
  App,
  Button,
  Col,
  ConfigProvider,
  DatePicker,
  Form,
  Input,
  Modal,
  Row,
  Select,
  SelectProps,
  Space,
  Table,
  TableProps,
  theme,
} from "antd";
import { useDarkMode, useLocalStorage } from "@reactuses/core";
import { useEffect, useState } from "react";
import dayjs, { Dayjs } from "dayjs";

interface DataType {
  name: string;
  symbol: string;
}

interface IProps {
  symbols: string[];
}
export default function Main(props: IProps) {
  const { symbols } = props;

  const [dark] = useDarkMode({
    classNameDark: "dark",
    classNameLight: "light",
    defaultValue: false,
  });

  const { message } = App.useApp();

  const columns: TableProps<DataType>["columns"] = [
    {
      title: "名称",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "市值",
      dataIndex: "marketCap",
      key: "marketCap",
    },
    {
      title: "股票代码",
      dataIndex: "symbol",
      key: "symbol",
    },
    {
      title: "时间",
      dataIndex: "time",
      key: "time",
    },
  ];

  const [form] = Form.useForm();
  const [addform] = Form.useForm();
  const [deleteform] = Form.useForm();

  const options: SelectProps["options"] = symbols.map((symbol) => ({
    label: symbol,
    value: symbol,
  }));

  const { token } = theme.useToken();

  const formStyle: React.CSSProperties = {
    maxWidth: "none",
    background: token.colorFillAlter,
    borderRadius: token.borderRadiusLG,
    padding: 24,
  };

  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const showDeleteModal = () => {
    setDeleteModalOpen(true);
  };

  const handleDeleteOk = () => {
    setDeleteModalOpen(false);
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
  };

  const [filters, setFilters] = useLocalStorage<
    { name: string; symbols: string[] }[]
  >("nasdaq-canlender-filters", []);

  const names = (filters || []).map((filter) => filter.name);

  const filterOptions: SelectProps["options"] = names.map((name) => ({
    label: name,
    value: name,
  }));

  const cancelAdd = () => {
    addform.resetFields();
    setIsModalOpen(false);
  };

  const submitAdd = () => {
    addform.validateFields().then((values) => {
      const filter = values["star symbol"] as string[];
      const name = values["name"];

      if (names.includes(name)) {
        message.error("过滤器名称已存在");
        return;
      }
      setFilters([...(filters || []), { name, symbols: filter }]);
      addform.resetFields();
      setIsModalOpen(false);
      message.success("添加成功");
    });
  };

  const cancelDelete = () => {
    deleteform.resetFields();
  };

  const submitDelete = () => {
    deleteform.validateFields().then((values) => {
      const names = values["delete star symbol"] as string[];
      const newFilter = (filters || []).filter(
        (filter) => !names.includes(filter.name)
      );
      setFilters(newFilter);
      message.success("删除成功");
      deleteform.resetFields();
      setDeleteModalOpen(false);
    });
  };

  const submit = (values: Record<string, Dayjs | string>) => {
    const date = values["date"] as Dayjs;
    const filter = values["filter"] as string;
    const symbols = filters?.find((f) => f.name === filter)?.symbols;
    syncData(date, symbols);
  };

  const [data, setData] = useState([]);

  const syncData = async (date: Dayjs, symbols: string[] = []) => {
    const data = await fetch(
      `/api?date=${date.format("YYYY-MM-DD")}`
    );
    const json = await data.json();
    const rows = (json?.data?.data?.rows || []).filter((row: any) => {

      if (!symbols.length) {
        return true;
      }

      return symbols.includes(row?.symbol);
    });
    setData(rows);
  };

  useEffect(() => {
    syncData(dayjs());
  }, []);

  return (
    <ConfigProvider
      theme={{
        algorithm: dark ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }}
    >
      <div className="App">
        <Form
          form={form}
          name="advanced_search"
          className="form"
          style={formStyle}
          onFinish={submit}
        >
          <Row gutter={24}>
            <Col span={8}>
              <Form.Item
                label="财报发布日期"
                name="date"
                initialValue={dayjs()}
              >
                <DatePicker placeholder="请选择日期" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="股票代码过滤器" name="filter">
                <Select
                  allowClear
                  style={{ width: "100%" }}
                  placeholder="请选择过滤器"
                  options={filterOptions}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={24}>
            <Form.Item label=" " colon={false}>
              <Button htmlType="submit" type="primary">
                查询
              </Button>
            </Form.Item>
          </Row>
        </Form>
        <Button type="primary" className="addCustom" onClick={showModal}>
          添加自定义过滤器
        </Button>
        <Button
          type="primary"
          className="addCustom"
          onClick={showDeleteModal}
          style={{ marginLeft: 20 }}
        >
          删除自定义过滤器
        </Button>
        <Modal
          title="删除自定义过滤器"
          open={deleteModalOpen}
          onOk={handleDeleteOk}
          onCancel={handleDeleteCancel}
          footer={[
            <Button key="reset" onClick={cancelDelete}>
              取消
            </Button>,
            <Button key="submit" onClick={submitDelete}>
              提交
            </Button>,
          ]}
        >
          <Form
            name="deleteFilter"
            labelCol={{ flex: "110px" }}
            labelAlign="left"
            labelWrap
            wrapperCol={{ flex: 1 }}
            colon={false}
            style={{ maxWidth: 600 }}
            form={deleteform}
          >
            <Form.Item
              label="过滤器"
              name="delete star symbol"
              rules={[{ required: true, message: "请选择删除的过滤器" }]}
            >
              <Select
                allowClear
                style={{ width: "100%" }}
                placeholder="请选择过滤器"
                mode="tags"
                options={filterOptions}
              />
            </Form.Item>
          </Form>
        </Modal>
        <Modal
          title="添加自定义过滤器"
          open={isModalOpen}
          onOk={handleOk}
          onCancel={handleCancel}
          footer={[
            <Button key="reset" onClick={cancelAdd}>
              取消
            </Button>,
            <Button key="submit" onClick={submitAdd}>
              提交
            </Button>,
          ]}
        >
          <Form
            name="addFilter"
            labelCol={{ flex: "110px" }}
            labelAlign="left"
            labelWrap
            wrapperCol={{ flex: 1 }}
            colon={false}
            style={{ maxWidth: 600 }}
            form={addform}
          >
            <Form.Item
              label="过滤器名称"
              name="name"
              rules={[{ required: true, message: "请输入过滤器名称" }]}
            >
              <Input allowClear placeholder="请输入过滤器名称" />
            </Form.Item>
            <Form.Item
              label="关注的股票"
              name="star symbol"
              rules={[{ required: true, message: "请选择关注的股票" }]}
            >
              <Select
                allowClear
                style={{ width: "100%" }}
                placeholder="请选择过滤器"
                mode="tags"
                options={options}
              />
            </Form.Item>
          </Form>
        </Modal>
        <Table columns={columns} dataSource={data} rowKey={(record) => record.symbol}/>
      </div>
    </ConfigProvider>
  );
}
