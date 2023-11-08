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

	public async willDeleteOne(query: Record<string, any>) {
		this.assertLockFieldInQuery(query)
		const q = await this.assertLockAndRemoveFromQuery(query)
		return {
			query: q,
		}
	}

	public async willUpdateOne(query: Record<string, any>) {
		this.assertLockFieldInQuery(query)
		const q = await this.assertLockAndRemoveFromQuery(query)
		return { query: q }
	}

	public async didFindOne(
		query: Record<string, any>,
		record: Record<string, any>
	) {
		const match = await this.db.findOne(this.lockCollectionName, {
			[this.primaryFieldName]: record[this.primaryFieldName],
		})
		return {
			valuesToMixinBeforeReturning: {
				[this.lockFieldName]: match?.[this.lockFieldName],
			},
		}
	}

	private async assertLockAndRemoveFromQuery(query: Record<string, any>) {
		const q = { ...query }
		const lock = q[this.lockFieldName]
		delete q[this.lockFieldName]

		await this.assertValidLock(lock)
		return q
	}

	private async assertValidLock(lock: any) {
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
	}

	private assertLockFieldInQuery(query: Record<string, any>) {
		if (!query[this.lockFieldName]) {
			throw new SpruceError({
				code: 'MISSING_LOCK_FIELD',
				lockFieldName: this.lockFieldName,
			})
		}
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
