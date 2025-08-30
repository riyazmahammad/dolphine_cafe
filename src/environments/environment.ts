export const environment = {
  production: false,
  appName: 'CafeteriaHub',
  version: '1.0.0',
  features: {
    emailVerification: true,
    passwordReset: true,
    multiTenant: true
  },
  deployment: {
    type: 'subdomain', // 'subdomain' | 'path' | 'standalone'
    adminSubdomain: 'admin',
    employeeSubdomain: 'employee',
    mainDomain: 'cafeteriahub.com'
  }
};