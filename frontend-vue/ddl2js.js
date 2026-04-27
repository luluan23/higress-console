import { Parser } from 'sql-ddl-to-json-schema';
import fs from "fs"


const parser = new Parser('mysql');

const sql = `
CREATE TABLE rules (
  id int unsigned NOT NULL AUTO_INCREMENT COMMENT 'ID',
  project varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '项目',
  name varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '规则名',
  description varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '描述',
  status tinyint DEFAULT NULL COMMENT '状态',
  template text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '规则',
  create_uid varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '创建人',
  created datetime DEFAULT NULL COMMENT '创建时间',
  is_del tinyint DEFAULT '0' COMMENT '是否删除',
  delete_time datetime DEFAULT NULL COMMENT '删除时间',
  PRIMARY KEY (id)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='项目';elete_time datetime DEFAULT NULL
`;

const compactJsonTablesArray = parser.feed(sql).toCompactJson(parser.results);

compactJsonTablesArray.forEach(v => {
    console.log(v)
    let schemaName = `./src/components/tpl/schema/${v.name}111.js`
    if (fs.existsSync(schemaName)) {
        return
    }
    let fields = []
    let firstUpper = v.name.charAt(0).toUpperCase() + v.name.slice(1)

    v.columns.forEach(info => {

        let field = {
            key: info.name,
            label: info.options.comment || info.name,
            type: info.type.datatype,
            nullable: info.options.nullable
        }
        fields.push(field)
    }
    )
    fs.writeFileSync(schemaName, `let ignoreField = {
    edit: [
        "id", "is_del", "delete_time"
    ],
    select: [
        "is_del", "delete_time"
    ],
    add: []
}

let fields =  ${JSON.stringify(fields, null, 4)}

export function fieldInfo(mode = "edit") {
    return fields.filter(v => !ignoreField[mode].includes(v.key))
}

export function api() {
    return {
        edit: "moduleUpdate${firstUpper}",
        select: "moduleGet${firstUpper}",
        add: "moduleAdd${firstUpper}"
    }
}
    `)
}
)
