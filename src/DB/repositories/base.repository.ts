import { HydratedDocument, Model, PopulateOptions, QueryFilter, QueryOptions, Types, UpdateQuery } from "mongoose";



abstract class BaseRepository<TDocument> {
    constructor(protected readonly model :Model<TDocument>){}

    async create(data: Partial <TDocument>):Promise <HydratedDocument<TDocument>>{
        return this.model.create(data)
    }

    async findById(id: Types.ObjectId):Promise <HydratedDocument<TDocument>|null>
    {
        return this.model.findById(id)
    }

    async findOne({filter,projection}:{ filter: QueryFilter<TDocument> , projection?: QueryFilter<TDocument>  }):
    Promise <HydratedDocument<TDocument>|null>
    {
        return this.model.findOne(filter,projection)
    }


    async find ({filter,projection,options}:{filter:QueryFilter<TDocument> ,projection?:QueryFilter<TDocument>,options?: QueryOptions<TDocument> }):
    Promise<HydratedDocument<TDocument>[]|[]>
    {
        return this.model.find(filter,projection )
        .sort(options?.sort)
        .skip(options?.skip!)
        .limit(options?.limit!)
        .populate(options?.populate as PopulateOptions)
    }


        findByIdAndUpdate({id , update ,options }:{id: Types.ObjectId ,update:UpdateQuery<TDocument>,options?: QueryOptions<TDocument> }):
        Promise <HydratedDocument<TDocument>|null>
    {
        return this.model.findByIdAndUpdate(id , update , {new: true,...options})
    }
    
    
    findOneAndUpdate({filter , update , options}:{filter:QueryFilter<TDocument>  , update:UpdateQuery<TDocument> , options?:UpdateQuery<TDocument>})
    :Promise <HydratedDocument<TDocument>|null>
    {
        return this.model.findOneAndUpdate(filter , update , {new: true,...options})
    }


    findOneAndDelete({filter , options} :{filter:QueryFilter<TDocument> , options?:UpdateQuery<TDocument>})
    :Promise <HydratedDocument<TDocument>| null>
    {
        return this.model.findOneAndDelete(filter , options)
    }

    async Paginate({
        page, limit , sort , populate , search
    }:{
        page?:number, limit?:number , sort?: any, populate?: any , search?: QueryFilter<TDocument>
    }){
        page = +page! || 1
        limit = +limit! || 1
        

        if(page < 1) page = 1
        if(limit < 1) limit = 2

        const skip = (page - 1) * limit

        const [data,totalDoc] = await  Promise.all([
        await this.model.find({...(search?? {}) }).skip(skip).limit(limit).sort(sort).populate(populate).exec(),
        await this.model.countDocuments({ ...(search?? {}) })
        ])

        return {
            meta:{
                currentPage: page,
                limit,
                totalDoc,
                totalPage: Math.ceil(totalDoc/limit)
            },

            data,
            totalDoc,
    }

    
}



}


export default BaseRepository