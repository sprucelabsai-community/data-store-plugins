import AbstractSpruceTest, { test, assert } from '@sprucelabs/test-utils'

export default class StorePluginAssertTest extends AbstractSpruceTest {
	@test()
	protected static async canCreateStorePluginAssert() {
		const storePluginAssert = new StorePluginAssert()
		assert.isTruthy(storePluginAssert)
	}

	@test()
	protected static async yourNextTest() {
		assert.isTrue(false)
	}
}

class StorePluginAssert {}
