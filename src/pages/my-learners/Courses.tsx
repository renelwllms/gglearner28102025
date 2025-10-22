import React, { useEffect, useMemo, useState } from 'react';
import { Empty, List, Tabs } from '@arco-design/web-react';
import * as services from '@/services';
const TabPane = Tabs.TabPane;
const courseName = {
  WorklifeCourses: 'WORK & LIFE SKILLS COURSES',
  HospitalityCourses: 'HOSPITALITY COURSES',
  FarmingUnits: 'FARMING AND PRIMARY INDUSTRIES',
};
function Courses({ rowData }: any) {
  const getContent = () => {
    const ret = Object.keys(courseName).map((key) => {
      if (!rowData[key]) return null;
      let dataSource = [];
      try {
        dataSource = JSON.parse(rowData[key]) || [];
      } catch (error) {}
      return (
        <TabPane key={key} title={courseName[key]}>
          <List
            size="small"
            header=""
            dataSource={dataSource}
            render={(item, index) => <List.Item key={index}>{item}</List.Item>}
          />
        </TabPane>
      );
    });
    if (ret?.every((e) => e === null)) {
      return (
        <>
          <Empty />
        </>
      );
    }
    return <Tabs type="rounded">{ret}</Tabs>;
  };
  return (
    <div
      style={{
        height: 400,
        width: '100%',
        overflow: 'auto',
      }}
    >
      {getContent()}
    </div>
  );
}

export default Courses;
