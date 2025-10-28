import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Typography, Card, Tabs } from '@arco-design/web-react';
import CourseList from './CourseList';
import UnitManagement from './UnitManagement';
import SchoolList from './SchoolList';
import TeacherList from './TeacherList';
import AdminUserList from './AdminUserList';
import EmailTemplateList from './EmailTemplateList';
import MicrocredentialList from './MicrocredentialList';
import RemoteRegistrationCategories from './RemoteRegistrationCategories';

const TabPane = Tabs.TabPane;

function Courses() {
  const isAdmin = useSelector((state: any) => state.isAdmin);
  const userInfo = useSelector((state: any) => state.userInfo);
  const token = useSelector((state: any) => state.token);

  return (
    <div>
      <Card bordered={false}>
        <Tabs defaultActiveTab="1">
          <TabPane key="1" title="Courses">
            <Card>
              <CourseList />
            </Card>
          </TabPane>
          <TabPane key="2" title="Unit Standards">
            <Card>
              <UnitManagement />
            </Card>
          </TabPane>
          <TabPane key="3" title="Schools">
            <Card>
              <SchoolList />
            </Card>
          </TabPane>
          <TabPane key="4" title="Teachers">
            <Card>
              <TeacherList />
            </Card>
          </TabPane>
          <TabPane key="5" title="Users">
            <Card>
              <AdminUserList />
            </Card>
          </TabPane>
          <TabPane key="6" title="Email Templates">
            <Card>
              <EmailTemplateList />
            </Card>
          </TabPane>
          <TabPane key="7" title="Microcredential Groups">
            <Card>
              <MicrocredentialList />
            </Card>
          </TabPane>
          <TabPane key="8" title="Remote Registration Categories">
            <Card>
              <RemoteRegistrationCategories />
            </Card>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
}

export default Courses;
