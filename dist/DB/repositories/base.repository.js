"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class BaseRepository {
    model;
    constructor(model) {
        this.model = model;
    }
    async create(data) {
        return this.model.create(data);
    }
    async findById(id) {
        return this.model.findById(id);
    }
    async findOne({ filter, projection }) {
        return this.model.findOne(filter, projection);
    }
    async find({ filter, projection, options }) {
        return this.model.find(filter, projection)
            .sort(options?.sort)
            .skip(options?.skip)
            .limit(options?.limit)
            .populate(options?.populate);
    }
    findByIdAndUpdate({ id, update, options }) {
        return this.model.findByIdAndUpdate(id, update, { new: true, ...options });
    }
    findOneAndUpdate({ filter, update, options }) {
        return this.model.findOneAndUpdate(filter, update, { new: true, ...options });
    }
    findOneAndDelete({ filter, options }) {
        return this.model.findOneAndDelete(filter, options);
    }
    async Paginate({ page, limit, sort, populate, search }) {
        page = +page || 1;
        limit = +limit || 1;
        if (page < 1)
            page = 1;
        if (limit < 1)
            limit = 2;
        const skip = (page - 1) * limit;
        const [data, totalDoc] = await Promise.all([
            await this.model.find({ ...(search ?? {}) }).skip(skip).limit(limit).sort(sort).populate(populate).exec(),
            await this.model.countDocuments({ ...(search ?? {}) })
        ]);
        return {
            meta: {
                currentPage: page,
                limit,
                totalDoc,
                totalPage: Math.ceil(totalDoc / limit)
            },
            data,
            totalDoc,
        };
    }
}
exports.default = BaseRepository;
