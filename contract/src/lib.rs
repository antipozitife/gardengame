#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, token, Address, Env};

#[contracttype]
pub enum DataKey {
    FlowerBalance(Address, u32),
    TotalFlowers(Address),
    LastWatering(Address),
    FlowerWatering(Address, u32),
}

#[contract]
pub struct FlowerContract;

#[contractimpl]
impl FlowerContract {
    // Покупка цветка с платежом
    pub fn buy_flower_with_payment(
        env: Env,
        buyer: Address,
        flower_id: u32,
        price: i128,
        shop_address: Address,
        native_token_address: Address, // Передаем адрес нативного токена как параметр
    ) -> u32 {
        buyer.require_auth();
        
        if flower_id == 0 || flower_id > 5 {
            panic!("Invalid flower ID: must be 1-5");
        }
        
        // Используем переданный адрес токена
        let token_client = token::Client::new(&env, &native_token_address);
        token_client.transfer(&buyer, &shop_address, &price);
        
        // Регистрируем покупку
        let key = DataKey::FlowerBalance(buyer.clone(), flower_id);
        let current: u32 = env.storage().persistent().get(&key).unwrap_or(0);
        let new_balance = current + 1;
        env.storage().persistent().set(&key, &new_balance);

        let total_key = DataKey::TotalFlowers(buyer.clone());
        let total: u32 = env.storage().persistent().get(&total_key).unwrap_or(0);
        env.storage().persistent().set(&total_key, &(total + 1));

        new_balance
    }

    // Полив отдельного цветка с платежом
    pub fn water_single_flower(
        env: Env,
        user: Address,
        flower_id: u32,
        price: i128,
        shop_address: Address,
        native_token_address: Address, // Передаем адрес нативного токена как параметр
    ) -> u64 {
        user.require_auth();
        
        if flower_id == 0 || flower_id > 5 {
            panic!("Invalid flower ID: must be 1-5");
        }
        
        // Используем переданный адрес токена
        let token_client = token::Client::new(&env, &native_token_address);
        token_client.transfer(&user, &shop_address, &price);
        
        // Сохраняем время полива
        let current_time = env.ledger().timestamp();
        let watering_key = DataKey::FlowerWatering(user.clone(), flower_id);
        env.storage().persistent().set(&watering_key, &current_time);
        
        current_time
    }

    // Получить время последнего полива цветка
    pub fn get_last_watering(env: Env, user: Address, flower_id: u32) -> u64 {
        let key = DataKey::FlowerWatering(user, flower_id);
        env.storage().persistent().get(&key).unwrap_or(0)
    }

    pub fn get_flower(env: Env, user: Address, flower_id: u32) -> u32 {
        let key = DataKey::FlowerBalance(user, flower_id);
        env.storage().persistent().get(&key).unwrap_or(0)
    }

    pub fn get_total(env: Env, user: Address) -> u32 {
        let key = DataKey::TotalFlowers(user);
        env.storage().persistent().get(&key).unwrap_or(0)
    }

    pub fn get_garden(env: Env, user: Address) -> soroban_sdk::Vec<u32> {
        let mut garden = soroban_sdk::Vec::new(&env);
        for flower_id in 1..=5 {
            let key = DataKey::FlowerBalance(user.clone(), flower_id);
            let count: u32 = env.storage().persistent().get(&key).unwrap_or(0);
            garden.push_back(count);
        }
        garden
    }
}
