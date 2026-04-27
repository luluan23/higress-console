// src/utils/crud-utils.js

/**
 * CRUD配置定义器（带验证）
 * @param {Object} userConfig 用户配置
 * @returns {Object} 标准化后的配置对象
 */
export const defineCrudConfig = (userConfig) => {
    const defaultConfig = {
        // 字段定义
        fields: [],

        // API端点配置
        api: {
            list: '',
            create: '',
            update: '',
            delete: '',
            detail: ''
        },

        // 表格全局配置
        table: {
            stripe: true,
            border: true,
            defaultSort: null,
            exclude: [],
            columns: {},
            rowKey: 'id'
        },

        // 表单全局配置
        form: {
            labelPosition: 'right',
            labelWidth: '100px',
            layout: {
                gutter: 20,
                responsive: true,
                defaultSpan: 24
            },
            exclude: []
        },

        // 搜索配置
        search: {
            layout: 'inline',
            operators: {},
            include: []
        },

        // 生命周期钩子
        hooks: {
            beforeCreate: null,
            afterCreate: null,
            beforeUpdate: null,
            afterUpdate: null
        }
    }

    // 合并配置
    const mergedConfig = deepMerge(defaultConfig, userConfig)
    // 执行验证
    validateConfig(mergedConfig)

    return mergedConfig
}

/**
 * 深度合并对象
 */
const deepMerge = (target, source) => {

    if (typeof target !== 'object' || typeof source !== 'object') return target


    Object.keys(source).forEach(key => {
        if (source[key] instanceof Object && !Array.isArray(source[key]) && typeof source[key] !== 'function') {
            if (!target[key]) Object.assign(target, { [key]: {} })
            deepMerge(target[key], source[key])
        } else {
            Object.assign(target, { [key]: source[key] })
        }
    })

    return target
}

/**
 * 配置验证
 */
const validateConfig = (config) => {
    const requiredKeys = [
        'fields',
        'api.list',
        'api.create',
        'api.update',
        'api.delete'
    ]

    requiredKeys.forEach(key => {
        const value = getNestedValue(config, key)
        if (!value) {
            throw new Error(`[CRUD Config] Missing required config: ${key}`)
        }
    })

    // 验证字段配置
    config.fields.forEach(field => {
        if (!field.key) {
            throw new Error('[CRUD Config] Field missing required property: key')
        }
        if (!field.label) {
            console.warn(`[CRUD Config] Field ${field.key} missing label property`)
        }
    })
}

/**
 * 获取嵌套对象值
 */
const getNestedValue = (obj, path) => {
    return path.split('.').reduce((o, p) => o?.[p], obj)
}