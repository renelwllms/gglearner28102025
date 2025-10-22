import api from './api';
import { request } from './request';

export const student = {
  async getStudentList(params) {
    const res = await request(api.getStudentList, params);
    return res;
  },
  
  async getStudentImageList(params) {
    const res = await request(api.getStudentImageList, params);
    return res;
  },
  async getStudentImage(params) {
    const res = await request(api.getStudentImageDownload, params);
    return res;
  },
  async getWorkshopStudent(params) {
    const res = await request(api.getWorkshopStudent, params);
    return res;
  },
  async getStudentResults(params) {
    const res = await request(api.getStudentResults, params);
    return res;
  },
  async getAllStudent(params) {
    const res = await request(api.getAllStudent, params);
    return res;
  },
  async setStudentTutor(params) {
    const res = await request(api.setStudentTutor, params);
    return res;
  },
  async setStudentCourse(params) {
    const res = await request(api.setStudentCourse, params);
    return res;
  },
  async getStudentCourse(params) {
    const res = await request(api.getStudentCourse, params);
    return res;
  },
  async getCourseStudent(params) {
    const res = await request(api.getCourseStudent, params);
    return res;
  },
  async getMyStudent(params) {
    const res = await request(api.getMyStudent, params);
    return res;
  },
  async getAllCourses(params) {
    const res = await request(api.getAllCourses, params);
    return res;
  },
  async getAllUnitStandard(params) {
    const res = await request(api.getAllUnitStandardByCourse, params);
    return res;
  },
  async deleteCourse(params) {
    const res = await request(api.deleteCourse, params);
    return res;
  },
  
  async getEmailAttachments(params) {
    const res = await request(api.getEmailAttachments, params);
    return res;
  },
  async getReport(params) {
    const res = await request(api.getReport, params);
    return res;
  },
};
