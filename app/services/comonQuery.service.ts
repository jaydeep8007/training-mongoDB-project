import employeeModel from "../models/employee.model";

const commonQueryMongo :any = (model: any) => {
  return {
    // ✅ CREATE new record
    async create(data: Record<string, any>) {
      try {
        const createdItem = await model.create(data);
        return createdItem;
      } catch (error) {
        throw error;
      }
    },

 // ✅ GET ALL records with pagination and manual employee attach
async getAll(
  filter: Record<string, any> = {},
  options: Record<string, any> = {}
) {
  try {
    const page = Number(options.page) > 0 ? Number(options.page) : 1;
    const results_per_page = Number(options.limit) > 0 ? Number(options.limit) : 10;
    const offset = (page - 1) * results_per_page;

    const total_data_count = await model.countDocuments(filter);

    const data = await model.find(filter , { _id: 0 }) //{ _id: 0 } this hides _id in response 
      .skip(offset)
      .limit(results_per_page)
      .lean();

    return {
      data,
      pagination: {
        page,
        results_per_page,
        total_data_count,
        total_pages: Math.ceil(total_data_count / results_per_page),
      }
    };
  } catch (error) {
    throw error;
  }
},

    // ✅ GET ONE record by filter
    async getOne(filter: Record<string, any> = {}) {
      try {
        const item = await model.findOne(filter);
        return item;
      } catch (error) {
        throw error;
      }
    },

    // ✅ GET BY ID
    async getById(id: string) {
      try {
        const item = await model.findById(id);
        return item;
      } catch (error) {
        throw error;
      }
    },

    // ✅ DELETE by filter or _id
    async deleteById(
      filter: Record<string, any> | string,
      options: { returnDeleted?: boolean } = {}
    ) {
      try {
        const whereClause =
          typeof filter === "object" ? filter : { _id: filter };

        const existingItem = await model.findOne(whereClause);
        if (!existingItem) {
          return {
            deleted: false,
            deletedCount: 0,
          };
        }

        const deletedItem = options.returnDeleted ? existingItem : null;
        const result = await model.deleteOne(whereClause);

        return {
          deleted: result.deletedCount > 0,
          deletedCount: result.deletedCount,
          deletedItem,
        };
      } catch (error) {
        throw error;
      }
    },

    // ✅ UPDATE by filter
    async update(filter: Record<string, any>, data: Record<string, any>) {
      try {
        const result = await model.updateMany(filter, data);

        // Optional: fetch updated documents
        const updatedRows = await model.find(filter);

        return {
          affectedCount: result.modifiedCount ?? result.nModified ?? 0,
          updatedRows,
        };
      } catch (error) {
        throw error;
      }
    },
  };
};

export default commonQueryMongo;
