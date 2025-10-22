import api from './courseApi';
import { request } from './request';

export const course = {
  // Get course list
  async getCourses(params) {
    const res = await request(api.getCourses, params);
    return res;
  },
  async getUnits(params) {
    const res = await request(api.getUnits, params);
    return res;
  },

  // Add a new course
  async addCourse(params) {
    const res = await request(api.addCourse, params);
    return res;
  },

  // Update course details
  async updateCourse(params) {
    const res = await request(api.updateCourse, params);
    return res;
  },

  // Delete course (excluding CourseID)
  async deleteCourse(params) {
    const res = await request(api.deleteCourse, params);
    return res;
  },
  async deleteSchool(params) {
    const res = await request(api.deleteSchool, params);
    return res;
  },
  async deleteUnitStandard(params) {
    const res = await request(api.deleteUnitStandard, params);
    return res;
  },

  async updateUnitstandard(params) {
    const res = await request(api.updateUnitstandard, params);
    return res;
  },

  
  // Add a new course
  async addSchool(params) {
    const res = await request(api.addSchool, params);
    return res;
  },

  // Update course details
  async updateSchool(params) {
    const res = await request(api.updateSchool, params);
    return res;
  },

  // Get courses with categories for settings
  async getCoursesWithCategories() {
    const res = await request(api.getCoursesWithCategories);
    return res;
  },

  // Get unit standards with categories for settings
  async getUnitStandardsWithCategories() {
    const res = await request(api.getUnitStandardsWithCategories);
    return res;
  },

  // Update course category
  async updateCourseCategory(params) {
    const res = await request(api.updateCourseCategory, params);
    return res;
  },

  // Update unit standard category
  async updateUnitStandardCategory(params) {
    const res = await request(api.updateUnitStandardCategory, params);
    return res;
  },

};
