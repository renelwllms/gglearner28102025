import React, { useState } from 'react';
import { Card, Tabs } from '@arco-design/web-react';
import SearchForm from './form';
import MyStoduentList from './MyStoduentList';


function LearnerSearch() {
  const [formParams, setFormParams] = useState({});
  const TabPane = Tabs.TabPane;

  const handleSearch = (params) => {
    setFormParams(params);
  };

  return (
    <div style={{ padding: 0, margin: 0 }}>
      <Tabs defaultActiveTab="1" destroyOnHide type="card-gutter">
        <TabPane key="1" title="All">
          <Card>
            <MyStoduentList
              allowStatusFilter={true}
              formParams={formParams}
            />
          </Card>
        </TabPane>
        <TabPane key="2" title="Working with School">
          <Card>
            <MyStoduentList
              AssignedTo={"School"}
              formParams={formParams}
            />
          </Card>
        </TabPane>
        <TabPane key="3" title="Working with GG">
          <Card>
            <MyStoduentList
              AssignedTo={"GET Group"}
              formParams={formParams}
            />
          </Card>
        </TabPane>
        <TabPane key="4" title="Complete">
          <Card>
            <MyStoduentList
              LearnerStatus={"Completed"}
              formParams={formParams}
            />
          </Card>
        </TabPane>
        <TabPane key="5" title="Withdrawn">
          <Card>
            <MyStoduentList
              LearnerStatus={"Withdrawn"}
              formParams={formParams}
            />
          </Card>
        </TabPane>
        <TabPane key="6" title="Follow-Up Needed">
          <Card>
            <MyStoduentList
              FollowUp={"30"}
              allowLastCommFilter={true}
              allowStudentTypeFilter={true}
              formParams={formParams}
            />
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
}

export default LearnerSearch;
