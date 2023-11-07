/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable no-redeclare */

import { default as SchemaEntity } from '@sprucelabs/schema'
import * as SpruceSchema from '@sprucelabs/schema'





export declare namespace SpruceErrors.DataStorePlugins {

	
	export interface MissingLockField {
		
			
			'lockFieldName': string
	}

	export interface MissingLockFieldSchema extends SpruceSchema.Schema {
		id: 'missingLockField',
		namespace: 'DataStorePlugins',
		name: 'Missing lock field',
		    fields: {
		            /** . */
		            'lockFieldName': {
		                type: 'text',
		                isRequired: true,
		                options: undefined
		            },
		    }
	}

	export type MissingLockFieldEntity = SchemaEntity<SpruceErrors.DataStorePlugins.MissingLockFieldSchema>

}



export declare namespace SpruceErrors.DataStorePlugins {

	
	export interface ExpiredLock {
		
			
			'lockFieldName': string
			
			'lockValue': string
	}

	export interface ExpiredLockSchema extends SpruceSchema.Schema {
		id: 'expiredLock',
		namespace: 'DataStorePlugins',
		name: 'Expired lock',
		    fields: {
		            /** . */
		            'lockFieldName': {
		                type: 'text',
		                isRequired: true,
		                options: undefined
		            },
		            /** . */
		            'lockValue': {
		                type: 'text',
		                isRequired: true,
		                options: undefined
		            },
		    }
	}

	export type ExpiredLockEntity = SchemaEntity<SpruceErrors.DataStorePlugins.ExpiredLockSchema>

}




