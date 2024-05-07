import {
    AbstractStore,
    DataStorePlugin,
    DataStorePluginWillFindResponse,
    Database,
} from '@sprucelabs/data-stores'
import { Schema, assertOptions } from '@sprucelabs/schema'
import { generateId } from '@sprucelabs/test-utils'
import SpruceError from '../errors/SpruceError'

export default class HistoryPlugin implements DataStorePlugin {
    private db: Database
    private entityCollectionName: string
    private periodIdFieldName: string
    private entityIdFieldName: string
    private store: AbstractStore<Schema>

    protected constructor(options: HistoryPluginOptions) {
        const {
            store,
            entityCollectionName,
            entityIdFieldName,
            periodIdFieldName,
        } = options

        this.db = store.getDb()
        this.store = store
        this.entityCollectionName = entityCollectionName
        this.entityIdFieldName = entityIdFieldName
        this.periodIdFieldName = periodIdFieldName
    }

    public static Plugin(options: HistoryPluginOptions) {
        assertOptions(options, [
            'store',
            'entityCollectionName',
            'periodIdFieldName',
            'entityIdFieldName',
        ])
        return new this(options)
    }

    public getName(): string {
        return 'history'
    }

    public async willFind(
        query: Record<string, any>
    ): Promise<void | DataStorePluginWillFindResponse> {
        return {
            query: {
                ...query,
                endTs: {
                    $gte: Date.now(),
                },
            },
        }
    }

    public async willCreateOne() {
        const updates: Record<string, any> = {
            createTs: Date.now(),
            endTs: getIndefiniteEndDateMs(),
        }

        const id = generateId()
        await this.db.createOne(this.entityCollectionName, {
            [this.entityIdFieldName]: id,
        })
        updates[this.entityIdFieldName] = id

        return {
            valuesToMixinBeforeCreate: updates,
        }
    }

    public async willUpdateOne(
        query: Record<string, any>,
        updates: Record<string, any>
    ) {
        const match = await this.findOne(query)
        if (!match) {
            return
        }
        const periodId = this.pluckPeriodId(match)

        const endTs = Date.now()

        await this.db.createOne(this.store.getCollectionName(), {
            ...match,
            [this.periodIdFieldName]: generateId(),
            createTs: endTs,
            endTs: getIndefiniteEndDateMs(),
            ...updates,
        })

        return {
            query: {
                [this.periodIdFieldName]: periodId,
            },
            newUpdates: {
                endTs,
            },
        }
    }

    private pluckPeriodId(match: any) {
        const periodId = match[this.periodIdFieldName]
        delete match[this.periodIdFieldName]
        return periodId
    }

    private async findOne(query: Record<string, any>) {
        return (await this.store.findOne(query)) as any
    }

    public async didCreateOne(record: Record<string, any>) {
        if (!record[this.entityIdFieldName]) {
            throw new SpruceError({
                code: 'MISSING_ENTITY_ID_FIELD_NAME',
                entityIdFieldName: this.entityIdFieldName,
            })
        }

        if (!record[this.periodIdFieldName]) {
            throw new SpruceError({
                code: 'MISSING_PERIOD_ID_FIELD_NAME',
                periodIdFieldName: this.periodIdFieldName,
            })
        }
    }
}

export interface HistoryPluginOptions {
    store: AbstractStore<Schema, Schema, Schema, Schema, any>
    entityCollectionName: string
    periodIdFieldName: string
    entityIdFieldName: string
}

export function getIndefiniteEndDateMs(): any {
    return new Date('2200-01-01 00:00:00-07').getTime()
}
