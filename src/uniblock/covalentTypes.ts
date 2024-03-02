export type CovalentRawTransaction = {
    block_signed_at: string
    block_height: number
    block_hash: string
    tx_hash: string
    tx_offset: number
    successful: boolean
    miner_address: string
    from_address: string
    from_address_label: any
    to_address: string
    to_address_label: any
    value: string
    value_quote: number
    pretty_value_quote: string
    gas_metadata: {
      contract_decimals: number
      contract_name: string
      contract_ticker_symbol: string
      contract_address: string
      supports_erc: any
      logo_url: string
    }
    gas_offered: number
    gas_spent: number
    gas_price: number
    fees_paid: string
    gas_quote: number
    pretty_gas_quote: string
    gas_quote_rate: number
    explorers: Array<{
      label: any
      url: string
    }>
    log_events: Array<{
      block_signed_at: string
      block_height: number
      tx_offset: number
      log_offset: number
      tx_hash: string
      raw_log_topics: Array<string>
      sender_contract_decimals?: number
      sender_name?: string
      sender_contract_ticker_symbol?: string
      sender_address: string
      sender_address_label: any
      sender_logo_url: string
      sender_factory_address: any
      raw_log_data?: string
      decoded: {
        name: string
        signature: string
        params: Array<{
          name: string
          type: string
          indexed: boolean
          decoded: boolean
          value: string
        }>
      }
    }>
  }