CREATE DATABASE  IF NOT EXISTS `sist_manutencao` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `sist_manutencao`;
-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: localhost    Database: sist_manutencao
-- ------------------------------------------------------
-- Server version	8.0.43

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `cargo`
--

DROP TABLE IF EXISTS `cargo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cargo` (
  `id_cargo` int NOT NULL AUTO_INCREMENT,
  `codigo` int NOT NULL,
  `cargo` varchar(45) NOT NULL,
  `descricao` text,
  PRIMARY KEY (`id_cargo`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cargo`
--

LOCK TABLES `cargo` WRITE;
/*!40000 ALTER TABLE `cargo` DISABLE KEYS */;
INSERT INTO `cargo` VALUES (1,1,'Operador','Opera as máquinas'),(2,2,'Manutentor','Executa e finaliza as ordens de serviço'),(3,3,'Administrador','Cadastra usuários, máquinas e setores'),(6,4,'Gerente de Manutenção','Gerencia as ordens de serviço');
/*!40000 ALTER TABLE `cargo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `estado`
--

DROP TABLE IF EXISTS `estado`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `estado` (
  `id_estado` int NOT NULL AUTO_INCREMENT,
  `codigo` int NOT NULL,
  `status` varchar(50) NOT NULL,
  PRIMARY KEY (`id_estado`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `estado`
--

LOCK TABLES `estado` WRITE;
/*!40000 ALTER TABLE `estado` DISABLE KEYS */;
INSERT INTO `estado` VALUES (1,1,'Aberto'),(2,2,'Em andamento'),(3,3,'Finalizado');
/*!40000 ALTER TABLE `estado` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `log_sistema`
--

DROP TABLE IF EXISTS `log_sistema`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `log_sistema` (
  `id_log` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int DEFAULT NULL,
  `tabela_afetada` varchar(50) NOT NULL,
  `acao` varchar(50) NOT NULL,
  `descricao` text,
  `data_hora` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_log`),
  KEY `fk_log_usuario_idx` (`id_usuario`),
  CONSTRAINT `fk_log_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `log_sistema`
--

LOCK TABLES `log_sistema` WRITE;
/*!40000 ALTER TABLE `log_sistema` DISABLE KEYS */;
/*!40000 ALTER TABLE `log_sistema` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `maquina`
--

DROP TABLE IF EXISTS `maquina`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `maquina` (
  `id_maquina` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(45) NOT NULL,
  `marca` varchar(45) NOT NULL,
  `modelo` varchar(45) DEFAULT NULL,
  `numero_serie` varchar(80) NOT NULL,
  `tag` varchar(45) DEFAULT NULL,
  `producao_hora` int DEFAULT NULL,
  `disponibilidade_mes` int NOT NULL,
  `id_setor` int NOT NULL,
  PRIMARY KEY (`id_maquina`),
  KEY `fk_maquina_setor_idx` (`id_setor`),
  CONSTRAINT `fk_maquina_setor` FOREIGN KEY (`id_setor`) REFERENCES `setor` (`id_setor`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `maquina`
--

LOCK TABLES `maquina` WRITE;
/*!40000 ALTER TABLE `maquina` DISABLE KEYS */;
INSERT INTO `maquina` VALUES (1,'laptop','asus','X515J','N1U2M3E4R5O6','123a',500,198,1),(2,'laptop','asus','Y626K','M2V3K2F5Q4P7','234b',200,234,3);
/*!40000 ALTER TABLE `maquina` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ordem_servico`
--

DROP TABLE IF EXISTS `ordem_servico`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ordem_servico` (
  `id_ord_serv` int NOT NULL AUTO_INCREMENT,
  `descricao` text NOT NULL,
  `solucao` text,
  `data_abertura` datetime NOT NULL,
  `data_inicio` datetime DEFAULT NULL,
  `data_termino` datetime DEFAULT NULL,
  `operacao` tinyint(1) NOT NULL DEFAULT '1',
  `custo` decimal(5,2) DEFAULT NULL,
  `id_usuario` int DEFAULT NULL,
  `id_estado` int NOT NULL,
  `id_maquina` int NOT NULL,
  PRIMARY KEY (`id_ord_serv`),
  KEY `id_usuario_idx` (`id_usuario`),
  KEY `id_estado_idx` (`id_estado`),
  KEY `id_os_maquina_idx` (`id_maquina`),
  CONSTRAINT `fk_os_estado` FOREIGN KEY (`id_estado`) REFERENCES `estado` (`id_estado`),
  CONSTRAINT `fk_os_maquina` FOREIGN KEY (`id_maquina`) REFERENCES `maquina` (`id_maquina`),
  CONSTRAINT `fk_os_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ordem_servico`
--

LOCK TABLES `ordem_servico` WRITE;
/*!40000 ALTER TABLE `ordem_servico` DISABLE KEYS */;
INSERT INTO `ordem_servico` VALUES (1,'Máquina queimou',NULL,'2025-09-20 00:00:00',NULL,NULL,1,NULL,NULL,1,1),(2,'Máquina quebrou a esteira',NULL,'2025-11-18 00:00:00','2025-11-18 08:00:00',NULL,0,NULL,3,2,2),(3,'Tela está quebrada','Trocamos a tela','2025-11-15 00:00:00','2025-11-15 08:00:00','2025-11-15 16:00:00',1,200.00,1,3,1),(4,'Teclado quebrado',NULL,'2025-11-18 00:00:00','2025-11-18 08:00:00',NULL,0,NULL,2,2,1),(5,'Barulho estranho alto',NULL,'2025-11-20 00:00:00',NULL,NULL,0,NULL,NULL,1,2);
/*!40000 ALTER TABLE `ordem_servico` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `os_abertas`
--

DROP TABLE IF EXISTS `os_abertas`;
/*!50001 DROP VIEW IF EXISTS `os_abertas`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `os_abertas` AS SELECT 
 1 AS `id_ord_serv`,
 1 AS `descricao`,
 1 AS `solucao`,
 1 AS `data_abertura`,
 1 AS `data_inicio`,
 1 AS `data_termino`,
 1 AS `operacao`,
 1 AS `custo`,
 1 AS `id_estado`,
 1 AS `codigo`,
 1 AS `status`,
 1 AS `id_maquina`,
 1 AS `nome_maquina`,
 1 AS `numero_serie`,
 1 AS `id_setor`,
 1 AS `setor`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `os_detalhada`
--

DROP TABLE IF EXISTS `os_detalhada`;
/*!50001 DROP VIEW IF EXISTS `os_detalhada`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `os_detalhada` AS SELECT 
 1 AS `id_ord_serv`,
 1 AS `descricao`,
 1 AS `solucao`,
 1 AS `data_abertura`,
 1 AS `data_inicio`,
 1 AS `data_termino`,
 1 AS `operacao`,
 1 AS `custo`,
 1 AS `id_usuario`,
 1 AS `nome_usuario`,
 1 AS `id_estado`,
 1 AS `codigo`,
 1 AS `status`,
 1 AS `id_maquina`,
 1 AS `nome_maquina`,
 1 AS `numero_serie`,
 1 AS `id_setor`,
 1 AS `setor`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `setor`
--

DROP TABLE IF EXISTS `setor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `setor` (
  `id_setor` int NOT NULL AUTO_INCREMENT,
  `setor` varchar(45) NOT NULL,
  `descricao` text,
  PRIMARY KEY (`id_setor`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `setor`
--

LOCK TABLES `setor` WRITE;
/*!40000 ALTER TABLE `setor` DISABLE KEYS */;
INSERT INTO `setor` VALUES (1,'Produção','Responsável pela fabricação de produtos e prestação de serviços.'),(3,'Manutenção','Responsável por reparar, trocar, consertar, lubrificar e monitorar o funcionamento das máquinas e seus componentes.');
/*!DAR UMA ENCHIDA NO SETOR PARA TESTAR - ;INSERT INTO `setor` VALUES (4,'Produçãoo','Responsável pela fabricação de produtos e prestação de serviços.'),(5,'Compras','Realiza aquisição de materiais e negociações com fornecedores.'),(6,'Logística','Gerencia estoque, transporte e distribuição de produtos.'),(7,'TI','Responsável pelo suporte técnico e infraestrutura de tecnologia.'),(8,'Marketing','Cuida da imagem da empresa e estratégias de divulgação.'),(9,'Vendas','Realiza negociações e atendimento comercial.'),(10,'Jurídico','Responsável por assuntos legais e contratuais.'),(11,'Manutenção','Mantém equipamentos e instalações funcionando corretamente.'),(12,'Qualidade','Garante padrões e controles de qualidade nos processos.'),(13,'Engenharia','Desenvolve projetos técnicos e melhorias estruturais.'),(14,'Pesquisa e Desenvolvimento','Cria novos produtos e melhora os existentes.'),(15,'Atendimento ao Cliente','Resolve dúvidas e problemas de clientes.'),(16,'Auditoria','Fiscaliza e revisa processos internos.'),(17,'Segurança do Trabalho','Cuida das normas de segurança e prevenção de acidentes.'),(18,'Expedição','Separa e envia pedidos aos clientes.'),(19,'Almoxarifado','Gerencia estoque interno e materiais.'),(20,'Planejamento','Organiza metas, cronogramas e estratégias da empresa.'),(21,'Contabilidade','Registra e controla todas as movimentações financeiras.'),(22,'Suprimentos','Gerencia materiais essenciais e consumo interno.'),(23,'Faturamento','Emite notas fiscais e controla receitas.'),(24,'Relações Públicas','Gerencia comunicação com parceiros e público externo.');*/;
/*!40000 ALTER TABLE `setor` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuario`
--

DROP TABLE IF EXISTS `usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuario` (
  `id_usuario` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(60) NOT NULL,
  `email` varchar(45) NOT NULL,
  `senha` varchar(65) NOT NULL,
  `id_cargo` int NOT NULL,
  `id_setor` int NOT NULL,
  PRIMARY KEY (`id_usuario`),
  KEY `id_cargo_idx` (`id_cargo`),
  KEY `id_setor_idx` (`id_setor`),
  CONSTRAINT `fk_usuario_cargo` FOREIGN KEY (`id_cargo`) REFERENCES `cargo` (`id_cargo`),
  CONSTRAINT `fk_usuario_setor` FOREIGN KEY (`id_setor`) REFERENCES `setor` (`id_setor`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuario`
--

LOCK TABLES `usuario` WRITE;
/*!40000 ALTER TABLE `usuario` DISABLE KEYS */;
INSERT INTO `usuario` VALUES (1,'Usuario','usuario@email.com','$2b$10$GEkZ8LN3gR3MhZWc40qS5.rN6YOZp2ap/nobZy6UJEXwTcaZnOTda',1,1),(2,'Gabriel','gabriel@gmail.com','$10$GEkZ8LN3gR3MhZWc40qS5.rN6YOZp2ap/nobZy6UJEXwTcaZnOTda',2,3),(3,'Vinicius','vinicius@fatec.com','$10$GEkZ8LN3gR3MhZWc40qS5.rN6YOZp2ap/nobZy6UJEXwTcaZnOTda',2,1);
/*!INSERIR UM USUARIO ADM NOVO PARA TESTAR INSERT INTO `usuario` VALUES (4,'Admin','admin@email.com','$2b$10$GEkZ8LN3gR3MhZWc40qS5.rN6YOZp2ap/nobZy6UJEXwTcaZnOTda',3,3);*/;

/*!40000 ALTER TABLE `usuario` ENABLE KEYS */;


UNLOCK TABLES;

--
-- Final view structure for view `os_abertas`
--

/*!50001 DROP VIEW IF EXISTS `os_abertas`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `os_abertas` AS select `os`.`id_ord_serv` AS `id_ord_serv`,`os`.`descricao` AS `descricao`,`os`.`solucao` AS `solucao`,`os`.`data_abertura` AS `data_abertura`,`os`.`data_inicio` AS `data_inicio`,`os`.`data_termino` AS `data_termino`,`os`.`operacao` AS `operacao`,`os`.`custo` AS `custo`,`e`.`id_estado` AS `id_estado`,`e`.`codigo` AS `codigo`,`e`.`status` AS `status`,`m`.`id_maquina` AS `id_maquina`,`m`.`nome` AS `nome_maquina`,`m`.`numero_serie` AS `numero_serie`,`s`.`id_setor` AS `id_setor`,`s`.`setor` AS `setor` from (((`ordem_servico` `os` join `estado` `e` on((`os`.`id_estado` = `e`.`id_estado`))) join `maquina` `m` on((`os`.`id_maquina` = `m`.`id_maquina`))) join `setor` `s` on((`m`.`id_setor` = `s`.`id_setor`))) where (`e`.`codigo` = 1) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `os_detalhada`
--

/*!50001 DROP VIEW IF EXISTS `os_detalhada`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `os_detalhada` AS select `os`.`id_ord_serv` AS `id_ord_serv`,`os`.`descricao` AS `descricao`,`os`.`solucao` AS `solucao`,`os`.`data_abertura` AS `data_abertura`,`os`.`data_inicio` AS `data_inicio`,`os`.`data_termino` AS `data_termino`,`os`.`operacao` AS `operacao`,`os`.`custo` AS `custo`,`u`.`id_usuario` AS `id_usuario`,`u`.`nome` AS `nome_usuario`,`e`.`id_estado` AS `id_estado`,`e`.`codigo` AS `codigo`,`e`.`status` AS `status`,`m`.`id_maquina` AS `id_maquina`,`m`.`nome` AS `nome_maquina`,`m`.`numero_serie` AS `numero_serie`,`s`.`id_setor` AS `id_setor`,`s`.`setor` AS `setor` from ((((`ordem_servico` `os` left join `usuario` `u` on((`os`.`id_usuario` = `u`.`id_usuario`))) join `estado` `e` on((`os`.`id_estado` = `e`.`id_estado`))) join `maquina` `m` on((`os`.`id_maquina` = `m`.`id_maquina`))) join `setor` `s` on((`m`.`id_setor` = `s`.`id_setor`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-22 20:25:47

