import { defineCrudConfig } from '../crud-utils'
import { useDataStore } from '@/stores'

export default defineCrudConfig({
    fields: [
        {
            key: "id",
            label: "ID",
            type: "int",
            nullable: false,
            table: {
                width: 80,
                align: 'center'
            },
            form: {
                hidden: true
            }
        },
        {
            key: "delete_time",
            label: "删除时间",
            type: "datetime",
            table: {
                hidden: true
            },
            form: {
                hidden: true
            }
        },
        {
            key: "resource_type_id",
            label: "",
            // type: "datetime",
            table: {
                hidden: true
            },
            form: {
                hidden: true
            }
        },
        /* {
            key: "project",
            label: "项目",
            type: "varchar",
            nullable: false,
            table: {
                width: 180,
                minWidth: 150

            },
            cache: true,
            form: {
                span: 12,
                component: {
                    type: 'el-select',
                    searchable: true,
                    remote: {
                        url: '/api/cmdb/getproject/listgroups',
                        params: (search) => ({ name: search }),
                        transform: (res) => {
                            return res.flatMap(v => v.childApps, 1).filter(v => ["200001094", "200001016"].includes(v.fatherAppId))
                        }
                    },
                    props: {
                        filterable: true,
                        optionLabel: 'appName',
                        optionValue: 'appId'
                    }
                }
            }
        }, */
        {
            key: "name",
            label: "资源名",
            type: "varchar",
            nullable: false,
            table: {
                // minWidth: 100
            },
            form: {
                span: 12,
                rules: [
                    { min: 2, max: 50, message: '长度3-50个字符' }
                ]
            }
        },
        // {
        //     key: "status",
        //     label: "状态",
        //     type: "tinyint",
        //     nullable: true,
        //     table: {
        //         width: 100,
        //         formatter: value => ({
        //             0: { text: '禁用', type: 'danger' },
        //             1: { text: '启用', type: 'success' }
        //         }[value])
        //     },
        //     form: {
        //         span: 12,
        //         component: {
        //             type: 'el-switch',
        //             props: {
        //                 'active-value': 1,
        //                 'inactive-value': 0,
        //                 'active-text': '启用',
        //                 'inactive-text': '禁用'
        //             }
        //         }
        //     }
        // },
        {
            key: "create_uid",
            label: "创建人",
            type: "varchar",
            // table: {
            //     hidden: true
            // },
            form: {
                hidden: true
            }
        },
        {
            key: "created",
            label: "创建时间",
            type: "datetime",
            nullable: true,
            table: {
                hidden: true,
                width: 180,
                formatter: 'datetime'
            },
            // form: {
            //     span: 12,
            //     hidden: true,
            //     component: {
            //         type: 'date-picker',
            //         props: {
            //             disabled: true
            //         }
            //     }
            // }
        },
        {
            key: "updated",
            label: "更新时间",
            type: "datetime",
            nullable: true,
            table: {
                width: 180,
                formatter: 'datetime'
            },
            // form: {
            //     span: 12,
            //     hidden: true,
            //     component: {
            //         type: 'date-picker',
            //         props: {
            //             disabled: true
            //         }
            //     }
            // }
        },
        {
            key: "is_del",
            label: "删除状态",
            type: "tinyint",
            nullable: true,
            table: {
                hidden: true
            },
            form: {
                hidden: true
            }
        },
        {
            key: "description",
            label: "描述",
            type: "varchar",
            nullable: true,
            form: {
                span: 12,
                rules: [
                    { max: 100, message: '长度≤100个字符' }
                ]
            }
        },
    ],

    // API配置
    api: {
        list: 'moduleGetPageResource',
        create: 'moduleAddResource',
        update: 'moduleUpdateResource',
        delete: 'moduleDeleteResource',
        detail: 'moduleGetResource'
    },

    // 表格全局配置
    table: {
        defaultSort: {
            prop: 'created',
            order: 'descending'
        },
        stripe: true,
        border: true
    },

    // 表单布局配置
    form: {
        labelPosition: 'top',
        layout: {
            gutter: 20,
            responsive: true,
            defaultSpan: 12
        }
    },
    store: useDataStore,
    check: (path) => {
        return ["demoList"].includes(path)
    }
})