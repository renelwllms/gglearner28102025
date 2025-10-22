import api from './api';
import { request } from './request';

export const commService = {
  async getTemplateList(params) {
    const res = await request(api.getCommunicationTemplates, params);
    return res;
  },
  async getAllTemplateList(params) {
    const res = await request(api.getAllTemplates, params);
    return res;
  },
  async deleteEmailTemplate(params) {
    const res = await request(api.deleteEmailTemplate, params);
    return res;
  },
  async AddTemplate(params) {
    const res = await request(api.addEmailTemplate, params);
    return res;
  },
  async UpdateTemplate(params) {
    const res = await request(api.updateEmailTemplate, params);
    return res;
  },
  async getList(params) {
    const res = await request(api.getCommunications, params);
    return res;
  },  
  async AddComm(params) {
    const res = await request(api.addCommunication, params);
    return res;
  },
  async UpdateComm(params) {
    const res = await request(api.updateCommunication, params);
    return res;
  },
  async UpdateLastCommDate(params) {
    const res = await request(api.updateLastCommDate, params);
    return res;
  },
  async deleteCommunication(params) {
    const res = await request(api.deleteCommunication, params);
    return res;
  }
};
