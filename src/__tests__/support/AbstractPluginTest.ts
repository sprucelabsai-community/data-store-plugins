import { DataStorePlugin, Database } from '@sprucelabs/data-stores'
import { Schema } from '@sprucelabs/schema'
import { AbstractSpruceFixtureTest } from '@sprucelabs/spruce-test-fixtures'
import { generateId } from '@sprucelabs/test-utils'
import { PluginStore } from '../tests.types'
import SpyStore, { SpyRecord } from './SpyStore'

export default abstract class AbstractPluginTest extends AbstractSpruceFixtureTest {
    protected static spy: PluginStore<Schema>
    protected static db: Database

    protected static async beforeEach() {
        await super.beforeEach()

        const stores = await this.stores.getStoreFactory()
        stores.setStoreClass('spy', SpyStore)

        this.db = await this.database.connectToDatabase()
        this.spy = await this.stores.getStore('spy')
    }

    protected static async createOne() {
        return (await this.spy.createOne(
            this.generateSpyRandomValues()
        )) as SpyRecord
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
