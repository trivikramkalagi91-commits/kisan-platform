import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
});

api.interceptors.response.use(
  res => res.data,
  err => {
    const message = err.response?.data?.error || 'Network error. Please try again.';
    return Promise.reject(new Error(message));
  }
);

// Crop Prices
export const getPrices = (params) => api.get('/prices', { params });
export const getStates = () => api.get('/prices/states');
export const getCommodities = () => api.get('/prices/commodities');
export const getTopMandis = (commodity) => api.get('/prices/top', { params: { commodity } });

// Government Schemes
export const getSchemes = (params) => api.get('/schemes', { params });
export const getScheme = (id) => api.get(`/schemes/${id}`);
export const checkEligibility = (data) => api.post('/schemes/check-eligibility', data);

// Labour
export const getJobs = (params) => api.get('/labour/jobs', { params });
export const postJob = (data) => api.post('/labour/jobs', data);
export const applyJob = (id, data) => api.post(`/labour/jobs/${id}/apply`, data);
export const getWorkTypes = () => api.get('/labour/work-types');

// Marketplace
export const getListings = (params) => api.get('/marketplace', { params });
export const getListing = (id) => api.get(`/marketplace/${id}`);
export const createListing = (data) => api.post('/marketplace', data);
export const getCategories = () => api.get('/marketplace/categories');
export const markSold = (id) => api.patch(`/marketplace/${id}/sold`);

// Barter
export const getBarterListings = (params) => api.get('/barter', { params });
export const postBarter = (data) => api.post('/barter', data);
export const getBarterCrops = () => api.get('/barter/crops');
export const getBarterStates = () => api.get('/barter/states');
export const closeBarter = (id) => api.patch(`/barter/${id}/close`);

// Finance
export const getLoans = (params) => api.get('/finance/loans', { params });
export const getLoan = (id) => api.get(`/finance/loans/${id}`);
export const getInsurance = () => api.get('/finance/insurance');
export const calcEMI = (data) => api.post('/finance/emi-calculator', data);

// AI Crop Advisor
export const getAdvisorStates = () => api.get('/advisor/states');
export const getAdvisorDistricts = (state) => api.get(`/advisor/districts/${state}`);
export const getRecommendations = (data) => api.post('/advisor/recommend', data);

// Fear Crusher
export const getFearCrops = () => api.get('/fear/crops');
export const getFearData = (crop) => api.get(`/fear/${encodeURIComponent(crop)}`);

// Videos
export const getVideos = (params) => api.get('/videos', { params });
export const getVideoCrops = () => api.get('/videos/crops');
export const getVideoLanguages = () => api.get('/videos/languages');

// Business Hub
export const getBusinessIdeas = (params) => api.get('/business', { params });
export const getBusinessIdea = (id) => api.get(`/business/${id}`);
export const getBusinessLoans = () => api.get('/business/meta/loans');
// Smart Irrigation
export const getIrrigationOptions = () => api.get('/irrigation/options');
export const predictIrrigation = (data) => api.post('/irrigation/predict', data);
export const predictAllIrrigation = (data) => api.post('/irrigation/predict-all', data);

// Subsidy Module
export const getSubsidyMeta = () => api.get('/subsidy/meta');
export const getSubsidies = (params) => api.get('/subsidy', { params });
export const getSubsidy = (id) => api.get(`/subsidy/${id}`);
export const applySubsidy = (data) => api.post('/subsidy/apply', data);
export const getSubsidyApplication = (ref) => api.get(`/subsidy/application/${ref}`);

export default api;