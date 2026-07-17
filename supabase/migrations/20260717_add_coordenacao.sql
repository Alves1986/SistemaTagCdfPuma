-- 1. Adicionar coluna coordenacao na tabela profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS coordenacao text;

-- 2. Padronizar nomes de gerências antigas (se houver)
UPDATE public.profiles
SET gerencia = 'Recuperação e Utilidades'
WHERE gerencia = 'Utilidades' OR gerencia = 'Recuperação';

-- 3. Corrigir espaços indevidos nas áreas (ex: 'CDF2 / ETAC2' para 'CDF2/ETAC2')
UPDATE public.profiles
SET area = REPLACE(area, ' / ', '/')
WHERE area LIKE '% / %';

-- 4. Atualizar o array de areas_coordenadas para remover espaços indevidos
UPDATE public.profiles
SET areas_coordenadas = (
  SELECT array_agg(REPLACE(elem, ' / ', '/'))
  FROM unnest(areas_coordenadas) AS elem
)
WHERE array_to_string(areas_coordenadas, ',') LIKE '% / %';

-- 5. Padronizar nomenclatura antiga de ENERGIA
UPDATE public.profiles
SET area = 'ENERGIA (TG)'
WHERE area = 'ENERGIA';

UPDATE public.profiles
SET areas_coordenadas = array_replace(areas_coordenadas, 'ENERGIA', 'ENERGIA (TG)')
WHERE 'ENERGIA' = ANY(areas_coordenadas);

-- (Opcional) Preencher automaticamente a coordenação para usuários de Recuperação e Utilidades 
-- baseando-se na área que eles possuem cadastrada
UPDATE public.profiles
SET coordenacao = 'Recuperação'
WHERE gerencia = 'Recuperação e Utilidades' 
  AND (area IN ('CDR1/EVAP1', 'CDR2/EVAP2', 'Planta Quimica (PQ)', 'Gaseificação', 'Caustificação') 
       OR 'CDR1/EVAP1' = ANY(areas_coordenadas)
       OR 'CDR2/EVAP2' = ANY(areas_coordenadas));

UPDATE public.profiles
SET coordenacao = 'Utilidades'
WHERE gerencia = 'Recuperação e Utilidades' 
  AND (area IN ('CDF1/ETAC1', 'CDF2/ETAC2', 'ETA/ETE', 'ENERGIA (TG)')
       OR 'CDF1/ETAC1' = ANY(areas_coordenadas)
       OR 'CDF2/ETAC2' = ANY(areas_coordenadas));
