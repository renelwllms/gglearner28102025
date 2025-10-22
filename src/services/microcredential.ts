import api from './microcredentialApi';
import { request } from './request';

export const microcredential = {
  // Get all microcredential groups
  async getGroups(params = {}) {
    const res = await request(api.getGroups, params);
    return res;
  },

  // Get single group details
  async getGroup(groupId: number) {
    const res = await request({
      ...api.getGroup,
      url: api.getGroup.url.replace(':groupId', String(groupId))
    });
    return res;
  },

  // Get available courses
  async getAvailableCourses(params = {}) {
    const res = await request(api.getAvailableCourses, params);
    return res;
  },

  // Create new group
  async createGroup(params: { GroupId?: number; CourseIds: number[] }) {
    const res = await request(api.createGroup, params);
    return res;
  },

  // Update group
  async updateGroup(groupId: number, params: { CourseIds: number[] }) {
    const res = await request({
      ...api.updateGroup,
      url: api.updateGroup.url.replace(':groupId', String(groupId))
    }, params);
    return res;
  },

  // Delete group
  async deleteGroup(groupId: number) {
    const res = await request({
      ...api.deleteGroup,
      url: api.deleteGroup.url.replace(':groupId', String(groupId))
    });
    return res;
  },

  // Remove course from group
  async removeCourse(groupId: number, courseId: number) {
    const res = await request({
      ...api.removeCourse,
      url: api.removeCourse.url
        .replace(':groupId', String(groupId))
        .replace(':courseId', String(courseId))
    });
    return res;
  },
};
