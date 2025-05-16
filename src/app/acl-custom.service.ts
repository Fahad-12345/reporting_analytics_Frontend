import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { createStore } from 'redux';
import { encrypt, decrypt, isEmptyObject, checkNUllEmptyUndefinedANdNullString } from './shared/utils/utils.helpers';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { StorageData } from './pages/content-pages/login/user.class';
const storageI = (state = 'localStorage', action) => {
    switch (action.type) {
        case 'localStorage':
            return 'localStorage';
        case 'sessionStorage':
            return 'sessionStorage';
        default:
            return state;
    }
};

const store = createStore(storageI);
@Injectable({
    providedIn: 'root'
})
export class AclServiceCustom {

    public decryptedPermission: any = {};

    config = {
        storage: 'localStorage',
        storageKey: 'AclService'
    };

    data = {
        roles: [],
        abilities: {}
    };

    constructor(
        public toaster: ToastrService,
        private router: Router,
        private storageData: StorageData
    ) {
        const render = () => {
            this.config.storage = store.getState();
        };
        render();
        store.subscribe(render);
    }

    /**
    * Does the given role have abilities granted to it?
    *
    * @param role
    * @returns {boolean}
    */
    roleHasAbilities(role) {
        this.resume();
        return (typeof this.data.abilities[role] === 'object');
    }
    /**
    *
    * @param type
    */
    setStorageType(type) {
        store.dispatch({ type: type });
    }

    /**
    * Retrieve the abilities array for the given role
    *
    * @param role
    * @returns {Array}
    */
    getRoleAbilities(role) {
        this.resume();
        return (this.roleHasAbilities(role)) ? this.data.abilities[role] : [];
    }

     convertFacilityToPracticeLocation(facilityId)
{
	var data = this.storageData.getUserPracticeLocationsData();
	for(var i = 0 ;i<data['facility_locations'].length;i++)
{
		if (facilityId == data['facility_locations'][i]['id'])
		{
			return data['facility_locations'][i]['facility_full_name'];
		}
	}
}
convertFacilityToPracticeLocationName(facilityName)
{
	var data = this.storageData.getUserPracticeLocationsData();
	for(var i = 0 ;i<data['facility_locations'].length;i++)
{
		if (facilityName == data['facility_locations'][i]['name'])
		{
			return data['facility_locations'][i]['facility_full_name'];
		}
	}
}

    /**
    * Restore data from web storage.
    *
    * Returns true if web storage exists and false if it doesn't.
    *
    * @returns {boolean}
    */
    resume() {
        var storedData;

        switch (this.config.storage) {
            case 'sessionStorage':
                storedData = this.fetchFromStorage('sessionStorage');
                break;
            case 'localStorage':
                storedData = this.fetchFromStorage('localStorage');
                break;
            default:
                storedData = null;
        }
        if (storedData) {
            _.extend(this.data, storedData);
            return true;
        }

        return false;
    }

    /**
    * Attach a role to the current user
    *
    * @param role
    */
    attachRole(role) {
        this.resume();
        if (this.data.roles.indexOf(role) === -1) {
            this.data.roles.push(role);
            this.save();
        }
    }

    /**
    * Remove role from current user
    *
    * @param role
    */
    detachRole(role) {
        this.resume();
        var i = this.data.roles.indexOf(role);
        if (i > -1) {
            this.data.roles.splice(i, 1);
            this.save();
        }
    }

    /**
    * Remove all roles from current user
    */
    flushRoles() {
        this.resume();
        this.data.roles = [];
        this.save();
    }

    /**
    * Check if the current user has role attached
    *
    * @param role
    * @returns {boolean}
    */
    hasRole(role) {
        this.resume();
        return (this.data.roles.indexOf(role) > -1);
    }

    /**
    * Returns the current user roles
    * @returns {Array}
    */
    getRoles() {
        this.resume();
        return this.data.roles;
    }

    /**
    * Set the abilities object (overwriting previous abilities)
    *
    * Each property on the abilities object should be a role.
    * Each role should have a value of an array. The array should contain
    * a list of all of the roles abilities.
    *
    * Example:
    *
    * {
    * guest: ['login'],
    * user: ['logout', 'view_content'],
    * admin: ['logout', 'view_content', 'manage_users']
    * }
    *
    * @param abilities
    */
    setAbilities(abilities) {
        this.resume();
        this.data.abilities = abilities;
        this.save();
    }

    /**
    * Add an ability to a role
    *
    * @param role
    * @param ability
    */
    addAbility(role, ability) {
        this.resume();
        if (!this.data.abilities[role]) {
            this.data.abilities[role] = [];
        }
        this.data.abilities[role].push(ability);
        this.save();
    }

    /**
    * Toggle ability of a role
    * If role is empty, current current roles are used
    *
    * @param role
    * @param ability
    * @param [force] - force add or remove
    */
    toggleAbility(role, ability, force) {
        this.resume();
        var roles = role ? [role] : this.data.roles;

        // Loop through roles
        for (var i = 0; i < roles.length; i++) {
            var role = roles[i];

            if (!this.data.abilities[role]) {
                this.data.abilities[role] = [];
            }

            var alreadyAdded = _.indexOf(this.data.abilities[role], ability) !== -1;
            var operation = !alreadyAdded;

            if (!alreadyAdded && force === true) {
                operation = true;
            }

            if (alreadyAdded && force === false) {
                operation = false;
            }

            if (operation === true) {
                this.data.abilities[role].push(ability);
            }

            if (operation === false) {
                this.data.abilities[role] = _.without(this.data.abilities[role], ability)
            }
        }

        this.save();
    }

    /**
    * Does current user have permission to do something?
    *
    * @param ability
    * @returns {boolean}
    */
    public permission: any
    can(ability) {
        if (this.storageData.isSuperAdmin()) {
            return true;
        }
        if (this.storageData.getPermissions()) {
            this.permission = this.storageData.getPermissions();
            return this.permission.includes(ability);
        }
        return false;
    }
    // We made it here, so the ability wasn't found in attached roles


    /**
    * Does current user have any of the required permission to do something?
    *
    * @param abilities [array]
    * @returns {boolean}
    */
    canAny(abilities) {
        this.resume();
        var role, roleAbilities;
        // Loop through roles
        var l = this.data.roles.length;
        var j = abilities.length;

        for (; l--;) {
            // Grab the the current role
            role = this.data.roles[l];
            roleAbilities = this.getRoleAbilities(role);

            for (; j--;) {
                if (roleAbilities.indexOf(abilities[j]) > -1) {
                    // Ability is in role abilities
                    return true;
                }
            }
        }
        // We made it here, so the ability wasn't found in attached roles
        return false;
    }

    /**
    * Persist data to storage based on config
    */
    private save() {
        switch (this.config.storage) {
            case 'sessionStorage':
                this.saveToStorage('sessionStorage');
                break;
            case 'localStorage':
                this.saveToStorage('localStorage');
                break;
            default:
                // Don't save
                return;
        }
    }

    /**
    * Persist data to web storage
    */
    private saveToStorage(storagetype) {
        // window[storagetype]['setItem'](this.config.storageKey, JSON.stringify(this.data));
        window[storagetype]['setItem'](this.config.storageKey, encrypt(this.data));
    }

    /**
    * Retrieve data from web storage
    */
    private fetchFromStorage(storagetype) {
        // var data = window[storagetype]['getItem'](this.config.storageKey);
        // return (data) ? JSON.parse(data) : false;
        let data;
        if ((window[storagetype]['getItem'](this.config.storageKey)) && isEmptyObject(this.decryptedPermission)) {
            data = decrypt(window[storagetype]['getItem'](this.config.storageKey));
            if (!data) {
                setTimeout(() => this.toaster.error('Something went wrong', 'Logout'));
                setTimeout(() => {
                    window.localStorage.clear();
                    this.decryptedPermission = {};
                    this.router.navigate(["/login"]);
                }, 1000);
            }
            else {
                this.decryptedPermission = data;
            }
        }
        else {
            if (localStorage.hasOwnProperty(this.config.storageKey)) {
                // 
                let storageData = window[storagetype]['getItem'](this.config.storageKey);
                if (!checkNUllEmptyUndefinedANdNullString(storageData)) {
                    setTimeout(() => this.toaster.error('Something went wrong', 'Logout'));
                    setTimeout(() => {
                        window.localStorage.clear();
                        this.decryptedPermission = {};
                        this.router.navigate(["/login"]);
                    }, 1000);
                }
            }
            data = this.decryptedPermission;
        }
        return (data) ? (data) : false;
    }
}
