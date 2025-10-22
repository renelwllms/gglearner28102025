import api from './api';
import { request } from './request';

export const adminUser = {
  async getAll(params) {
    const res = await request(api.getAdminUserList, params);
    return res;
  }, 
  async getActiveAll() {
    const res = await request(api.getUserActivelist, {});
    return res;
  }, 
  async getByEmail(params) {
    const res = await request(api.getByEmail, params);
    return res;
  },  
  async Add(params) {
    const res = await request(api.addAdminUser, params);
    return res;
  },  
  async Update(params) {
    const res = await request(api.updateAdminUser, params);
    return res;
  },
  async delete(params) {
    const res = await request(api.deleteAdminUser, params);
    return res;
  },


};
