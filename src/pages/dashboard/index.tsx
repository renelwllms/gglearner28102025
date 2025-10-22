import React, { useEffect, useState } from 'react';
import { Card, Grid, Spin, Statistic, Message } from '@arco-design/web-react';
import { IconUser, IconFile, IconCalendar, IconUserGroup } from '@arco-design/web-react/icon';
import { Chart, Interval, Line, Coordinate, Axis, Tooltip, Legend } from 'bizcharts';
import * as services from '@/services';
import styles from './style/index.module.less';
import moment from 'moment';

const { Row, Col } = Grid;

interface DashboardStats {
  totalStudents: number;
  totalWorkshops: number;
  activeStudents: number;
  totalCourses: number;
  monthlyRegistrations: Array<{ month: string; count: number }>;
  monthlyWorkshops: Array<{ month: string; count: number }>;
  assignmentDistribution: Array<{ month: string; school: number; getGroup: number }>;
  ethnicityBreakdown: Array<{ ethnicity: string; count: number; percent: number }>;
}

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const currentYear = moment().year();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await services.g.getDashboardStats({ year: currentYear });
      console.log('Dashboard stats response:', response);
      console.log('Ethnicity breakdown data:', response.data?.ethnicityBreakdown);
      setStats(response.data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      Message.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size={40} />
      </div>
    );
  }

  if (!stats) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '50px 0' }}>
          No dashboard data available
        </div>
      </Card>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 style={{ margin: 0 }}>Dashboard - {currentYear}</h2>
      </div>

      {/* Summary Statistics Cards */}
      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Students"
              value={stats.totalStudents}
              prefix={<IconUser style={{ color: '#165DFF' }} />}
              countUp
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Workshops"
              value={stats.totalWorkshops}
              prefix={<IconFile style={{ color: '#00B42A' }} />}
              countUp
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Active Students"
              value={stats.activeStudents}
              prefix={<IconUserGroup style={{ color: '#FF7D00' }} />}
              countUp
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Courses"
              value={stats.totalCourses}
              prefix={<IconCalendar style={{ color: '#ED45A0' }} />}
              countUp
            />
          </Card>
        </Col>
      </Row>

      {/* Monthly Registrations - Bar Chart */}
      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col span={12}>
          <Card title="Student Registrations by Month" bordered>
            <Chart
              height={300}
              data={stats.monthlyRegistrations}
              autoFit
              padding={[20, 20, 60, 60]}
            >
              <Interval position="month*count" color="#165DFF" />
              <Axis name="month" label={{ autoRotate: true }} />
              <Axis name="count" />
              <Tooltip shared />
            </Chart>
          </Card>
        </Col>

        {/* Monthly Workshops - Bar Chart */}
        <Col span={12}>
          <Card title="Workshops by Month" bordered>
            <Chart
              height={300}
              data={stats.monthlyWorkshops}
              autoFit
              padding={[20, 20, 60, 60]}
            >
              <Interval position="month*count" color="#00B42A" />
              <Axis name="month" label={{ autoRotate: true }} />
              <Axis name="count" />
              <Tooltip shared />
            </Chart>
          </Card>
        </Col>
      </Row>

      {/* School vs GET Group - Line Chart */}
      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col span={16}>
          <Card title="Student Distribution: School vs GET Group" bordered>
            <Chart
              height={350}
              data={stats.assignmentDistribution.flatMap(item => [
                { month: item.month, type: 'School', value: item.school },
                { month: item.month, type: 'GET Group', value: item.getGroup }
              ])}
              autoFit
              padding={[20, 20, 60, 80]}
            >
              <Line
                position="month*value"
                color={['type', ['#165DFF', '#ED45A0']]}
                shape="smooth"
              />
              <Axis name="month" label={{ autoRotate: true }} />
              <Axis name="value" />
              <Tooltip shared />
              <Legend position="top-right" />
            </Chart>
          </Card>
        </Col>

        {/* Ethnicity Breakdown - Pie Chart */}
        <Col span={8}>
          <Card title="Ethnicity Distribution" bordered>
            <Chart
              height={350}
              data={stats.ethnicityBreakdown}
              autoFit
              padding={[20, 20, 100, 20]}
            >
              <Coordinate type="theta" radius={0.75} innerRadius={0.5} />
              <Tooltip showTitle={false} />
              <Axis visible={false} />
              <Interval
                position="percent"
                adjust="stack"
                color="ethnicity"
                style={{
                  lineWidth: 1,
                  stroke: '#fff',
                }}
              />
              <Legend position="bottom" />
            </Chart>
          </Card>
        </Col>
      </Row>

      {/* Additional Statistics Table */}
      <Row gutter={16}>
        <Col span={24}>
          <Card title="Summary" bordered>
            <Row gutter={16}>
              <Col span={8}>
                <div style={{ marginBottom: 16 }}>
                  <strong>Registration Trend:</strong>
                  <div style={{ color: '#86909c', fontSize: 14, marginTop: 4 }}>
                    Peak month: {stats.monthlyRegistrations.reduce((max, curr) =>
                      curr.count > max.count ? curr : max, stats.monthlyRegistrations[0])?.month || 'N/A'}
                  </div>
                </div>
              </Col>
              <Col span={8}>
                <div style={{ marginBottom: 16 }}>
                  <strong>Workshop Activity:</strong>
                  <div style={{ color: '#86909c', fontSize: 14, marginTop: 4 }}>
                    Peak month: {stats.monthlyWorkshops.reduce((max, curr) =>
                      curr.count > max.count ? curr : max, stats.monthlyWorkshops[0])?.month || 'N/A'}
                  </div>
                </div>
              </Col>
              <Col span={8}>
                <div style={{ marginBottom: 16 }}>
                  <strong>Dominant Ethnicity:</strong>
                  <div style={{ color: '#86909c', fontSize: 14, marginTop: 4 }}>
                    {stats.ethnicityBreakdown.reduce((max, curr) =>
                      curr.count > max.count ? curr : max, stats.ethnicityBreakdown[0])?.ethnicity || 'N/A'}
                    ({stats.ethnicityBreakdown.reduce((max, curr) =>
                      curr.count > max.count ? curr : max, stats.ethnicityBreakdown[0])?.percent.toFixed(1) || '0'}%)
                  </div>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default Dashboard;
