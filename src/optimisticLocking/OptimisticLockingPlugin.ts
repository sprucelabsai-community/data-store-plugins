import {
	DataStorePlugin,
	DataStorePluginHookResponse,
	Database,
} from '@sprucelabs/data-stores'
import { assertOptions } from '@sprucelabs/schema'
import { generateId } from '@sprucelabs/test-utils'
import SpruceError from '../errors/SpruceError'

export default class OptimisticLockingPlugin implements DataStorePlugin {
	private db: Database
	private lockCollectionName: string
	private primaryFieldName: string
	private lockFieldName: string
	protected constructor(options: OptimisticLockingPluginOptions) {
		const { database, lockCollectionName, primaryFieldName, lockFieldName } =
			options

		this.db = database
		this.lockCollectionName = lockCollectionName
		this.primaryFieldName = primaryFieldName
		this.lockFieldName = lockFieldName
	}

	public static Plugin(options: OptimisticLockingPluginOptions) {
		assertOptions(options, [
			'database',
			'lockCollectionName',
			'primaryFieldName',
			'lockFieldName',
		])

		return new this(options)
	}

	public async willCreateOne(
		values: Record<string, any>
	): Promise<void | DataStorePluginHookResponse> {
		const lock = generateId()
		await this.db.createOne(this.lockCollectionName, {
			[this.primaryFieldName]: values[this.primaryFieldName],
			[this.lockFieldName]: lock,
		})

		return {
			valuesToMixinBeforeReturning: {
				[this.lockFieldName]: lock,
			},
		}
	}

	public async willUpdateOne(query: Record<string, any>) {
		debugger
		if (!query[this.lockFieldName]) {
			throw new SpruceError({
				code: 'MISSING_LOCK_FIELD',
				lockFieldName: this.lockFieldName,
			})
		}

		debugger

		const q = { ...query }
		const lock = q[this.lockFieldName]
		delete q[this.lockFieldName]

		const match = await this.db.count(this.lockCollectionName, {
			[this.lockFieldName]: lock,
		})

		if (match === 0) {
			throw new SpruceError({
				code: 'EXPIRED_LOCK',
				lockFieldName: this.lockFieldName,
				lockValue: lock,
			})
		}

		return { query: q }
	}

	public getName(): string {
		return 'optimisticLocking'
	}
}
interface OptimisticLockingPluginOptions {
	database: Database
	lockCollectionName: string
	primaryFieldName: string
	lockFieldName: string
}
