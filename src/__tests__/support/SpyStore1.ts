import {
	AbstractStore,
	DataStorePlugin,
	Database,
	StoreFactory,
	UniversalStoreOptions,
} from '@sprucelabs/data-stores'
import { buildSchema, SchemaValues } from '@sprucelabs/schema'

export default class SpyStore1 extends AbstractStore<SpyRecordSchema> {
	public db!: Database
	public storeFactory!: StoreFactory
	public name = 'test'
	public options: any

	public findArgs: any[] = []

	protected collectionName = 'test'
	protected createSchema = spySchema
	protected updateSchema = spySchema
	protected fullSchema = spySchema
	protected databaseSchema = spySchema
	public wasInitializedInvoked = false
	public static initializeCount = 0

	public static async Store(options: UniversalStoreOptions) {
		const store = new this(options.db)
		store.db = options.db
		store.storeFactory = options.storeFactory
		store.options = options
		return store
	}

	public async initialize() {
		this.wasInitializedInvoked = true
		SpyStore1.initializeCount++
	}

	//@ts-ignore
	public async find(...args: any[]): Promise<SpyRecord[]> {
		this.findArgs.push(args)
		//@ts-ignore
		return super.find(...args)
	}

	public setCollectionName(name: string): void {
		this.collectionName = name
	}

	public addPlugin(plugin: DataStorePlugin) {
		this.plugins.push(plugin)
	}

	public clearPlugins() {
		this.plugins = []
	}

	public setPrimaryKeyField(name: string) {
		this.primaryFieldNames = [name]
	}
}

declare module '@sprucelabs/data-stores/build/types/stores.types' {
	interface StoreMap {
		spy1: SpyStore1
	}

	interface StoreOptionsMap {
		spy1: { testOption: boolean }
	}
}

const spySchema = buildSchema({
	id: 'test',
	fields: {
		id: {
			type: 'id',
		},
		alternativeId: {
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

type SpyRecordSchema = typeof spySchema
export type SpyRecord = SchemaValues<SpyRecordSchema>
