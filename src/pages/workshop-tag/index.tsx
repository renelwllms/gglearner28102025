import React, { useEffect, useState } from 'react';
import {
  Card,
  Button,
  Message,
  Input,
  Collapse,
  Tag,
  Tooltip,
  Grid,
} from '@arco-design/web-react';
import * as services from '@/services';
import SearchForm from './form';
import { IconSend } from '@arco-design/web-react/icon';
const CollapseItem = Collapse.Item;
const { Row, Col } = Grid;

interface WorkshopTagProps {}

interface WorkshopData {
  code: string;
  qrCode?: string;
}

function WorkshopTag() {
  const [code, setCode] = useState('');
  const [generateCode, setGenerateCode] = useState('');
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);

  useEffect(() => {
    try {
      const storedCode = localStorage.getItem('generateCode');
      const storedQR = localStorage.getItem('generateQRCode');
      if (storedCode) {
        setGenerateCode(storedCode);
      }
      if (storedQR) {
        setQrCodeData(storedQR);
      }
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
    }
  }, []);

  function handleClick() {
    if (!code) return Message.warning('Please enter a workshop code');
    window.open(`/learner?code=${code}`);
  }

  const handleGenerateAgain = () => {
    try {
      localStorage.setItem('generateCode', '');
      localStorage.setItem('generateQRCode', '');
      setGenerateCode('');
      setQrCodeData(null);
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
      Message.error('Failed to clear code');
    }
  };

  const handleCodeGenerated = (val: string | WorkshopData) => {
    try {
      const codeValue = typeof val === 'string' ? val : val.code;
      const qrCode = typeof val === 'object' ? val.qrCode : null;

      localStorage.setItem('generateCode', codeValue);
      setGenerateCode(codeValue);
      setCode(codeValue);

      if (qrCode) {
        localStorage.setItem('generateQRCode', qrCode);
        setQrCodeData(qrCode);
      }
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
      Message.error('Failed to save code');
    }
  };

  return (
    <Card>
      <div style={{ marginBottom: '20px' }}>
        <Row gutter={[12, 12]} justify="center">
          <Col xs={24} sm={20} md={16} lg={14} xl={12}>
            <Input.Search
              value={code}
              placeholder="Enter the workshop code to start collecting learners data"
              onChange={(e) => setCode(e)}
              searchButton={
                <Tooltip content="Open learner collection page">
                  <Button type="primary" icon={<IconSend />} />
                </Tooltip>
              }
              onSearch={handleClick}
            />
          </Col>
        </Row>
      </div>
      <Row justify="center">
        <Col xs={24} sm={20} md={18} lg={16} xl={14}>
          <Collapse defaultActiveKey={['1']}>
            <CollapseItem header="Generate a unique workshop group code" name="1">
              {generateCode ? (
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ marginBottom: '10px' }}>The currently generated code:</div>
                    <Tag
                      color={'#00b42a'}
                      style={{ margin: '0 16px 16px 0', cursor: 'pointer' }}
                      onClick={() => {
                        setCode(generateCode);
                        Message.success('Code copied to input field');
                      }}
                    >
                      {generateCode}
                    </Tag>
                  </div>

                  {qrCodeData && (
                    <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                      <div style={{ marginBottom: '10px', fontWeight: 'bold' }}>
                        QR Code for Students
                      </div>
                      <div style={{
                        display: 'inline-block',
                        padding: '20px',
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }}>
                        <img
                          src={qrCodeData}
                          alt="Workshop QR Code"
                          style={{
                            width: '300px',
                            height: '300px',
                            display: 'block'
                          }}
                        />
                      </div>
                      <div style={{ marginTop: '10px', color: '#86909c', fontSize: '14px' }}>
                        Students can scan this QR code to enroll in the workshop
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={handleGenerateAgain}
                    type="primary"
                  >
                    Generate again
                  </Button>
                </div>
              ) : (
                <SearchForm
                  onSubmit={handleCodeGenerated}
                  IsPaidAllow={false}
                />
              )}
            </CollapseItem>
          </Collapse>
        </Col>
      </Row>
    </Card>
  );
}

export default WorkshopTag;
