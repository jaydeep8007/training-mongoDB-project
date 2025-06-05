import sequelize from "../config/sequelize";

import job from "./job.model";
import employee from "./employee.model";
import employeeJob from "./employee_job.model";

import customerModel from "./customer.model";
import customerAuthModel from "./customerAuth.model";

// One customer has one auth entry
customerModel.hasOne(customerAuthModel, {
  foreignKey: "cus_id",
  as: "auth",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

// Auth belongs to a customer
customerAuthModel.belongsTo(customerModel, {
  foreignKey: "cus_id",
  as: "customer",
});

// // One-to-many relation
// employee.hasMany(job, { foreignKey: 'job_id' , as: 'job' });
// job.belongsTo(employee, { foreignKey: 'emp_id' ,as: 'employee' });

// Each Employee belongs to one Job
employee.belongsTo(job, {
  foreignKey: "job_id",
  as: "job",
});

// One Job has many Employees
job.hasMany(employee, {
  foreignKey: "job_id",
  as: "employees",
});

export default {
  sequelize,
  employee,
  job,
  employeeJob,
  customerModel,
  customerAuthModel,
};
