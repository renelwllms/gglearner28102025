import api from './api';
import { request } from './request';

export const g = {
  async getTutor(params) {
    const res = await request(api.getTutor, params);
    return res;
  },
  async getCourse(params) {
    const res = await request(api.getCourse, params);
    return res;
  },
  async getUnit(params) {
    const res = await request(api.getUnit, params);
    return res;
  },
  async addWorkshop(params) {
    const res = await request(api.addWorkshop, params);
    return res;
  },
  async postWorkshop(params) {
    const res = await request(api.postWorkshop, params);
    return res;
  },
  async addDocument(params) {
    const res = await request(api.addDocument, params);
    return res;
  },
  async deleteDocument(params) {
    const res = await request(api.deleteDocument, params);
    return res;
  },
  async addWorkshopInfo(params) {
    const res = await request(api.addWorkshopInfo, params);
    return res;
  },
  async addWorkshopInfoExtra(params) {
    const res = await request(api.addWorkshopInfoExtra, params);
    return res;
  },
  async addWworkshopstudent(params) {
    const res = await request(api.addWworkshopstudent, params);
    return res;
  },
  async addStudent(params) {
    const res = await request(api.addStudent, params);
    return res;
  },
  async postWorkshopInfo(params) {
    const res = await request(api.postWorkshopInfo, params);
    return res;
  },
  async deleteWorkshopInfo(params) {
    const res = await request(api.deleteWorkshopInfo, params);
    return res;
  },
  async postStudentInfo(params) {
    const res = await request(api.postStudentInfo, params);
    return res;
  },
  async deleteStudentInfo(params) {
    const res = await request(api.deleteStudentInfo, params);
    return res;
  },
  async getWorkshop(params) {
    const res = await request(api.getWorkshop, params);
    return res;
  },
  async deleteWorkshop(params) {
    const res = await request(api.deleteWorkshop, params);
    return res;
  },
  async getWorkshopInforByCode(params) {
    const res = await request(api.getWorkshopInforByCode, params);
    return res;
  },
  async getWorkshopResult(params) {
    const res = await request(api.getWorkshopResult, params);
    return res;
  },  
  async getWorkshopCourseResult(params) {
    const res = await request(api.getWorkshopCourseResult, params);
    return res;
  },
  async getCodeUnits(params) {
    const res = await request(api.getCodeUnits, params);
    return res;
  },
  async getCourseUnits(params) {
    const res = await request(api.getCourseUnits, params);
    return res;
  },
  async submitResult(params) {
    const res = await request(api.submitResult, params);
    return res;
  },
  async AddAssessResult(params) {
    const res = await request(api.addAssessResult, params);
    return res;
  },
  async WorkshopStatusChange(params) {
    const res = await request(api.WorkshopStatusChange, params);
    return res;
  },
  async WorkshopPaymentStatusChange(params) {
    const res = await request(api.WorkshopPaymentStatusChange, params);
    return res;
  },
  async RemoteLearnerCertificateRequest(params) {
    const res = await request(api.RemoteLearnerCertificateRequest, params);
    return res;
  },
  async AddCourse(params) {
    const res = await request(api.AddCourse, params);
    return res;
  },
  async UpdateCourse(params) {
    const res = await request(api.UpdateCourse, params);
    return res;
  },
  async submitAllResult(params) {
    const res = await request(api.submitAllResult, params);
    return res;
  },
  async assessAllresult(params) {
    const res = await request(api.assessAllresult, params);
    return res;
  },
  async submitStudentResult(params) {
    const res = await request(api.submitStudentResult, params);
    return res;
  },
  async verifyCode(params) {
    const res = await request(api.verifyCode, params);
    return res;
  },
  async getSchool(params) {
    const res = await request(api.getSchool, params);
    return res;
  },
  async getReport1(params) {
    const res = await request(api.getReport1, params);
    return res;
  },
  async getReport2(params) {
    const res = await request(api.getReport2, params);
    return res;
  },
  async getReport3(params) {
    const res = await request(api.getReport3, params);
    return res;
  },
  async getReport4(params) {
    const res = await request(api.getReport4, params);
    return res;
  },
  async getReport5(params) {
    const res = await request(api.getReport5, params);
    return res;
  },
  async getReport6(params) {
    const res = await request(api.getReport6, params);
    return res;
  },
  async getReport7(params) {
    const res = await request(api.getReport7, params);
    return res;
  },
  async getDashboardStats(params) {
    const res = await request(api.getDashboard, params);
    return res;
  },
  async sendEmail(params) {
    const res = await request(api.sendEmail, params);
    return res;
  },
  async sendcertificateEmail(params, opt) {
    const res = await request(api.sendcertificateEmail, params, opt);
    return res;
  },
  async downloadcertificate(params, opt) {
    const res = await request(api.downloadcertificate, params, opt);
    return res;
  },

  async sendResultEmail(params) {
    const res = await request(api.sendResultEmail, params);
    return res;
  },
  async sendEmailMicro(params) {
    const res = await request(api.sendEmailMicro, params);
    return res;
  },
  async deleteAttachement(params) {
    const res = await request(api.deleteAttachments, params);
    return res;
  },
  async addEmailAttachment(params) {
    const res = await request(api.addAttachments, params);
    return res;
  },
};
