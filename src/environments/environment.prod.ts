export const environment = {
  production: true,
  appName: 'CafeteriaHub',
  version: '1.0.0',
  features: {
    emailVerification: true,
    passwordReset: true,
    multiTenant: true
  },
  deployment: {
    type: 'subdomain',
    adminSubdomain: 'admin',
    employeeSubdomain: 'employee',
    mainDomain: 'cafeteriahub.com'
  }
};