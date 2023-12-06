import { DataStorePlugin, Database } from '@sprucelabs/data-stores'
import { AbstractSpruceFixtureTest } from '@sprucelabs/spruce-test-fixtures'
import { generateId } from '@sprucelabs/test-utils'
import SpyStore from './SpyStore'

export default abstract class AbstractPluginTest extends AbstractSpruceFixtureTest {
	protected static spy: SpyStore
	protected static db: Database

	protected static async beforeEach() {
		await super.beforeEach()

		const stores = await this.stores.getStoreFactory()
		stores.setStoreClass('spy', SpyStore)

		this.db = await this.database.connectToDatabase()
		this.spy = await this.stores.getStore('spy')
	}

	protected static async createOne() {
		return await this.spy.createOne(this.generateSpyRandomValues())
	}

	protected static addPlugin(plugin: DataStorePlugin) {
		this.spy.addPlugin(plugin)
	}

	protected static generateSpyRandomValues() {
		return {
			firstName: generateId(),
			lastName: generateId(),
		}
	}
}
