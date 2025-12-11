#![no_std]

use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, Vec};

#[contracttype]
pub enum DataKey {
    FlowerBalance(Address, u32),
    TotalFlowers(Address),
    LastWatering(Address),
}

#[contract]
pub struct FlowerContract;

#[contractimpl]
impl FlowerContract {
    
    pub fn buy_flower(
        env: Env,
        buyer: Address,
        flower_id: u32,
    ) -> u32 {
        buyer.require_auth();

        let key = DataKey::FlowerBalance(buyer.clone(), flower_id);
        let current: u32 = env.storage().persistent().get(&key).unwrap_or(0);
        let new_balance = current + 1;
        
        env.storage().persistent().set(&key, &new_balance);

        let total_key = DataKey::TotalFlowers(buyer.clone());
        let total: u32 = env.storage().persistent().get(&total_key).unwrap_or(0);
        env.storage().persistent().set(&total_key, &(total + 1));

        new_balance
    }

    pub fn water_flowers(env: Env, user: Address) -> u64 {
        user.require_auth();
        
        let current_time = env.ledger().timestamp();
        env.storage().persistent().set(&DataKey::LastWatering(user), &current_time);
        current_time
    }

    pub fn get_flower(env: Env, user: Address, flower_id: u32) -> u32 {
        let key = DataKey::FlowerBalance(user, flower_id);
        env.storage().persistent().get(&key).unwrap_or(0)
    }

    pub fn get_total(env: Env, user: Address) -> u32 {
        let key = DataKey::TotalFlowers(user);
        env.storage().persistent().get(&key).unwrap_or(0)
    }

    pub fn get_garden(env: Env, user: Address) -> Vec<u32> {
        let mut garden = Vec::new(&env);
        for flower_id in 1..=5 {
            let key = DataKey::FlowerBalance(user.clone(), flower_id);
            let count: u32 = env.storage().persistent().get(&key).unwrap_or(0);
            garden.push_back(count);
        }
        garden
    }
}
