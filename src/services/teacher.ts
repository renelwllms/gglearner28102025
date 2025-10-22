import api from './api';
import { request } from './request';

export const teacher = {
  async getAll(params) {
    const res = await request(api.getAllTutorList, params);
    return res;
  },  
  async AddTeacher(params) {
    const res = await request(api.addTeacher, params);
    return res;
  },  
  async UpdateTeacher(params) {
    const res = await request(api.updateTeacher, params);
    return res;
  },
  async deleteTeacher(params) {
    const res = await request(api.deleteTeacher, params);
    return res;
  },

};
