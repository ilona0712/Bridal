CREATE TABLE conversation_reads (                                        
    conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE   
  CASCADE,                                                              
    user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE      
  CASCADE,                                                           
    last_read_at    timestamptz NOT NULL DEFAULT now(),                    
    PRIMARY KEY (conversation_id, user_id)             
  );                                                                       
    
  ALTER TABLE conversation_reads ENABLE ROW LEVEL SECURITY;                
                                                           
  -- Users can only read/write their own rows
  CREATE POLICY "Users can read their own reads"                           
    ON conversation_reads FOR SELECT            
    USING (auth.uid() = user_id);                                          
                                 
  CREATE POLICY "Users can upsert their own reads"                         
    ON conversation_reads FOR INSERT                                       
    WITH CHECK (auth.uid() = user_id);
                                                                           
  CREATE POLICY "Users can update their own reads"
    ON conversation_reads FOR UPDATE              
    USING (auth.uid() = user_id);