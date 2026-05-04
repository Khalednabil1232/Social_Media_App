"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findOne = exports.findById = exports.find = exports.create = void 0;
const create = ({ model, data }) => {
    return model.create(data);
};
exports.create = create;
const find = ({ model, check }) => {
    return model.find(check);
};
exports.find = find;
const findById = ({ model, check }) => {
    return model.findById(check);
};
exports.findById = findById;
const findOne = ({ model, check }) => {
    return model.findById(check);
};
exports.findOne = findOne;
