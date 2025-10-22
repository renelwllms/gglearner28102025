import React, { useState } from 'react';
import { Typography, Card, Tabs } from '@arco-design/web-react';
import Remote from './Remote';
import StoduentList from './StoduentList';
import Workshop from './Workshop';
import All from './All';
import SearchForm from './form';
const TabPane = Tabs.TabPane;
function Courses() {
  const [formParams, setFormParams] = useState({});
  const [activeTab, setActiveTab] = useState('1');

  const handleSearch = (params) => {
    setFormParams(params);
  };

  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  return (
    <div style={{ padding: 0, margin: 0 }}>
      <Tabs activeTab={activeTab} onChange={handleTabChange} type="card-gutter">
        <TabPane key="1" title="All">
          <Card>
            <SearchForm onSearch={handleSearch} />
            <StoduentList formParams={formParams} />
          </Card>
        </TabPane>
        <TabPane key="2" title="Working with School">
          <Card>
            <SearchForm onSearch={handleSearch} />
            <StoduentList
              AssignedTo={"School"} formParams={formParams} />
          </Card>
        </TabPane>
        <TabPane key="3" title="Working with GG">
          <Card>
            <SearchForm onSearch={handleSearch} />
            <StoduentList
              AssignedTo={"GET Group"} formParams={formParams}
            />
          </Card>
        </TabPane>
        <TabPane key="4" title="Complete">
          <Card>
            <SearchForm onSearch={handleSearch} />
            <StoduentList
              LearnerStatus={"Completed"} formParams={formParams} />
          </Card>
        </TabPane>
        <TabPane key="5" title="Withdrawn">
          <Card>
            <SearchForm onSearch={handleSearch} />
            <StoduentList
              LearnerStatus={"Withdrawn"} formParams={formParams} />
          </Card>
        </TabPane>
        <TabPane key="6" title="Follow-Up Needed">
          <Card>
            <SearchForm onSearch={handleSearch} />
            <StoduentList
              FollowUp={"30"} formParams={formParams} />
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
}

export default Courses;
