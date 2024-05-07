import {
    AbstractStore,
    DataStorePlugin,
    Database,
    StoreFactory,
    UniversalStoreOptions,
} from '@sprucelabs/data-stores'
import { buildSchema, SchemaValues } from '@sprucelabs/schema'
import { PluginStore } from '../tests.types'

export default class HistoryStore
    extends AbstractStore<
        SpyHistoryRecordSchema,
        SpyHistoryRecordSchema,
        SpyHistoryRecordSchema,
        SpyHistoryDatabaseRecordSchema,
        'periodId'
    >
    implements
        PluginStore<
            SpyHistoryRecordSchema,
            SpyHistoryRecordSchema,
            SpyHistoryRecordSchema,
            SpyHistoryDatabaseRecordSchema,
            'periodId'
        >
{
    public db!: Database
    public storeFactory!: StoreFactory
    public name = 'test'
    public options: any

    public findArgs: any[] = []
    protected primaryFieldNames = ['periodId' as const]
    protected collectionName = 'test'
    protected createSchema = spyHistorySchema
    protected updateSchema = spyHistorySchema
    protected fullSchema = spyHistorySchema
    protected databaseSchema = spyHistoryDatabaseSchema
    public wasInitializedInvoked = false

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

    public clearPlugins() {
        this.plugins = []
    }

    public setPrimaryFieldNames(names: ('periodId' | 'periodId2')[]) {
        this.primaryFieldNames = names as any
    }
}

declare module '@sprucelabs/data-stores/build/types/stores.types' {
    interface StoreMap {
        history: HistoryStore
    }

    interface StoreOptionsMap {}
}

const spyHistorySchema = buildSchema({
    id: 'spyHistoryRecord',
    fields: {
        entityId: {
            type: 'id',
        },
        entityId2: {
            type: 'id',
        },
        periodId: {
            type: 'id',
        },
        periodId2: {
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

const spyHistoryDatabaseSchema = buildSchema({
    id: 'spyHistoryDatabase',
    fields: {
        entityId: {
            type: 'id',
        },
        entityId2: {
            type: 'id',
        },
        periodId: {
            type: 'id',
        },
        periodId2: {
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

type SpyHistoryRecordSchema = typeof spyHistorySchema
type SpyHistoryDatabaseRecordSchema = typeof spyHistoryDatabaseSchema
export type SpyHistoryRecord = SchemaValues<SpyHistoryRecordSchema>
export type SpyHistoryDatabaseRecord =
    SchemaValues<SpyHistoryDatabaseRecordSchema>
