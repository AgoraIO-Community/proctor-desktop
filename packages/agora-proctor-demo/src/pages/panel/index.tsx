import { Button, Card, Form, Input } from "antd";
import { useCallback, useState } from "react";

const mediaRecorderOptions = {
  audioBitsPerSecond: 128000,
  videoBitsPerSecond: 2500000,
  mimeType: "video/webm;codecs=vp9",
};

const constraints = {
  audio: true,
  video: true,
};

const blobOptions = {
  type: "video/webm",
};

const useRecordHooks = () => {
  const [mediaRecorder, setMediaRecorder] = useState<any>(null);

  const recordedBlobs: BlobPart[] = [];

  const createMediaRecorder = () => {
    if (navigator.mediaDevices) {
      navigator.mediaDevices.getDisplayMedia(constraints).then((stream) => {
        const mediaRecorder = new MediaRecorder(stream, mediaRecorderOptions);

        mediaRecorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            recordedBlobs.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          const fileName = `oliver-${Date.now()}`;
          const superBuffer = new Blob(recordedBlobs, blobOptions);
          const link = document.createElement("a");
          link.href = URL.createObjectURL(superBuffer);
          link.setAttribute("download", `${fileName}.webm`);
          link.click();
        };
        mediaRecorder.start();

        setMediaRecorder((pre: any) => mediaRecorder);
      });
    }
  };

  return [mediaRecorder, createMediaRecorder];
};

export const ManipulatePanel = () => {
  const [mediaRecorder, createMediaRecorder] = useRecordHooks();
  const [form] = Form.useForm();

  const onFinish = useCallback((value) => {
    console.log(value);
  }, []);

  const start = () => {
    !mediaRecorder ? createMediaRecorder() : mediaRecorder.start();
  };

  const stop = () => {
    mediaRecorder.stop();
  };
  return (
    <Card
      title="Agora manipulate Panel"
      style={{ width: 800, margin: "60px auto" }}
    >
      <Form
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 14 }}
        form={form}
        name="control-hooks"
        onFinish={onFinish}
      >
        <Form.Item
          name="roomUuid"
          label="roomUuid"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="userUuid"
          label="userUuid"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
        <Form.Item name="alter" label="alert" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item wrapperCol={{ span: 12, offset: 6 }}>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      </Form>
      <Button type="primary" onClick={start}>
        start
      </Button>
      <Button type="primary" onClick={stop}>
        stop
      </Button>
    </Card>
  );
};
