import {
    AbstractStore,
    DataStorePlugin,
    Database,
    StoreFactory,
    UniversalStoreOptions,
} from '@sprucelabs/data-stores'
import { buildSchema, SchemaValues } from '@sprucelabs/schema'
import { PluginStore } from '../tests.types'

export default class HistoryStore2
    extends AbstractStore<
        SpyHistory2RecordSchema,
        SpyHistory2RecordSchema,
        SpyHistory2RecordSchema,
        SpyHistory2DatabaseRecordSchema,
        'id'
    >
    implements
        PluginStore<
            SpyHistory2RecordSchema,
            SpyHistory2RecordSchema,
            SpyHistory2RecordSchema,
            SpyHistory2DatabaseRecordSchema,
            'id'
        >
{
    public db!: Database
    public storeFactory!: StoreFactory
    public name = 'test'
    public options: any

    public findArgs: any[] = []
    protected primaryFieldNames = ['id' as const]
    protected collectionName = 'test'
    protected createSchema = spyHistory2Schema
    protected updateSchema = spyHistory2Schema
    protected fullSchema = spyHistory2Schema
    protected databaseSchema = spyHistory2DatabaseSchema
    public wasInitializedInvoked = false
    public static initializeCount = 0

    public static async Store(options: UniversalStoreOptions) {
        const store = new this(options.db)
        store.db = options.db
        store.storeFactory = options.storeFactory
        store.options = options
        return store
    }

    public addPlugin(plugin: DataStorePlugin) {
        this.plugins.push(plugin)
    }
}

declare module '@sprucelabs/data-stores/build/types/stores.types' {
    interface StoreMap {
        spyHistory2: HistoryStore2
    }

    interface StoreOptionsMap {}
}

const spyHistory2Schema = buildSchema({
    id: 'spyHistory2Record',
    fields: {
        parentId: {
            type: 'id',
        },
        id: {
            type: 'id',
        },
        firstName: {
            type: 'text',
            label: 'First Name',
        },
        lastName: {
            type: 'text',
            label: 'Last Name',
        },
    },
})

const spyHistory2DatabaseSchema = buildSchema({
    id: 'spyHistory2Database',
    fields: {
        entityId: {
            type: 'id',
        },
        id: {
            type: 'id',
        },
        firstName: {
            type: 'text',
            label: 'First Name',
        },
        lastName: {
            type: 'text',
            label: 'Last Name',
        },
        createTs: {
            type: 'dateTime',
        },
        endTs: {
            type: 'dateTime',
        },
    },
})

type SpyHistory2RecordSchema = typeof spyHistory2Schema
type SpyHistory2DatabaseRecordSchema = typeof spyHistory2DatabaseSchema
export type SpyHistory2Record = SchemaValues<SpyHistory2RecordSchema>
export type SpyHistory2DatabaseRecord =
    SchemaValues<SpyHistory2DatabaseRecordSchema>
