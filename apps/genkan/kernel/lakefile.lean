import Lake
open Lake DSL

package «genkan-kernel»

@[default_target]
lean_lib Genkan where
  globs := #[.submodules `Genkan]

@[default_target]
lean_exe «genkan-kernel» where
  root := `Main
