import { AbstractStore, DataStorePlugin } from '@sprucelabs/data-stores'
import { Schema, SchemaFieldNames } from '@sprucelabs/schema'

export interface PluginStore<
    FullSchema extends Schema,
    CreateSchema extends Schema = FullSchema,
    UpdateSchema extends Schema = CreateSchema,
    DatabaseSchema extends Schema = FullSchema,
    PrimaryFieldName extends SchemaFieldNames<DatabaseSchema> | 'id' = any,
> extends AbstractStore<
        FullSchema,
        CreateSchema,
        UpdateSchema,
        DatabaseSchema,
        PrimaryFieldName
    > {
    addPlugin(plugin: DataStorePlugin): void
}
